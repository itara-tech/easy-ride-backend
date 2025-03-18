import prisma from "../configs/database.js"
import {
  processPayment as processPaypackPayment,
  processRefund as processPaypackRefund,
  getAccountInfo as getPaypackAccount,
} from "./paypackService.js"


export const createPaymentTransaction = async (
  customerId,
  amount,
  phoneNumber,
  description,
  tripId,
  paymentGateway = "simple",
  paymentMethod = null,
) => {
  // Verify trip exists and belongs to customer
  const trip = await prisma.trip.findUnique({
    where: {
      id: tripId,
      customerId,
    },
  })

  if (!trip) {
    throw new Error("Trip not found or does not belong to this customer")
  }

  // Get customer details
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { name: true, email: true, phone: true },
  })

  let paymentResponse

  if (paymentGateway.toLowerCase() === "paypack") {
    // Process payment through PayPack
    paymentResponse = await processPaypackPayment(amount, phoneNumber, description)

    // Store the payment reference in the database
    if (paymentResponse.success) {
      const paymentReference = paymentResponse.data.ref || `PAYPACK-${Date.now()}`

      await prisma.trip.update({
        where: { id: tripId },
        data: {
          paymentReference,
          paymentGateway: "PAYPACK",
          paymentStatus: paymentResponse.status === "success" ? "SUCCESS" : "PENDING",
          paymentMethod: "MOMO",
        },
      })

      // If payment is successful, update wallet
      if (paymentResponse.status === "success") {
        const wallet = await prisma.wallet.findUnique({
          where: { customerId },
        })

        if (wallet) {
          await prisma.wallet.update({
            where: { customerId },
            data: {
              balance: { decrement: amount },
            },
          })
        }
      }
    }
  } else if (paymentGateway.toLowerCase() === "simple") {
    // Validate payment method
    if (!paymentMethod || !["MOMO", "CARD", "CASH"].includes(paymentMethod)) {
      throw new Error("Invalid payment method. Must be MOMO, CARD, or CASH")
    }

    // Generate a unique payment reference
    const paymentReference = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Update the trip with payment information
    await prisma.trip.update({
      where: { id: tripId },
      data: {
        paymentReference,
        paymentMethod,
        paymentStatus: "SUCCESS",
        paymentGateway: "SIMPLE",
      },
    })

    // Create a payment record
    const payment = await prisma.payment.create({
      data: {
        reference: paymentReference,
        amount,
        phoneNumber,
        description: description || `Payment for trip ${tripId}`,
        method: paymentMethod,
        status: "SUCCESS",
        tripId,
        customerId,
      },
    })

    // Update customer wallet if needed
    const wallet = await prisma.wallet.findUnique({
      where: { customerId },
    })

    if (wallet) {
      await prisma.wallet.update({
        where: { customerId },
        data: {
          balance: { decrement: amount },
        },
      })
    }

    // Create notifications
    await prisma.notification.create({
      data: {
        customerId,
        title: "Payment Successful",
        message: `Your payment of ${amount} RWF for trip ${tripId} was successful.`,
        isRead: false,
      },
    })

    if (trip.driverId) {
      await prisma.notification.create({
        data: {
          driverId: trip.driverId,
          title: "Payment Received",
          message: `Payment of ${amount} RWF for trip ${tripId} was received.`,
          isRead: false,
        },
      })
    }

    paymentResponse = {
      success: true,
      data: {
        paymentReference,
        amount,
        status: "SUCCESS",
        method: paymentMethod,
        createdAt: payment.createdAt,
      },
    }
  } else {
    throw new Error("Invalid payment gateway. Must be paypack or simple")
  }

  return paymentResponse
}

/**
 * Check payment status
 * @param {String} reference - Payment reference
 * @param {String} paymentGateway - Payment gateway used (paypack or simple)
 * @returns {Promise<Object>} - Payment status
 */
export const checkPaymentStatus = async (reference, paymentGateway = "simple") => {
  let response

  if (paymentGateway.toLowerCase() === "paypack") {
    // For PayPack, we would need to check the transaction status
    // This is a simplified version as PayPack might not have a direct status check API
    response = {
      success: true,
      data: {
        status: "PENDING", // Default status
        message: "Payment status check not directly supported by PayPack",
      },
    }

    // Find the trip associated with this payment
    const trip = await prisma.trip.findFirst({
      where: { paymentReference: reference },
    })

    if (trip) {
      response.data.status = trip.paymentStatus
    }
  } else if (paymentGateway.toLowerCase() === "simple") {
    // For simple payments, just check the database
    const payment = await prisma.payment.findUnique({
      where: { reference },
    })

    if (payment) {
      response = {
        success: true,
        data: {
          reference: payment.reference,
          amount: payment.amount,
          status: payment.status,
          method: payment.method,
          createdAt: payment.createdAt,
        },
      }
    } else {
      response = {
        success: false,
        message: "Payment not found",
      }
    }
  } else {
    throw new Error("Invalid payment gateway. Must be paypack or simple")
  }

  return response
}

/**
 * Get payment history for a user
 * @param {String} userId - User ID
 * @param {String} userType - User type (CUSTOMER or DRIVER)
 * @param {Number} offset - Pagination offset
 * @param {Number} limit - Pagination limit
 * @returns {Promise<Object>} - Payment history
 */
export const getUserPaymentHistory = async (userId, userType, offset = 0, limit = 10) => {
  // Get trips with payment information
  let trips = []

  if (userType === "CUSTOMER") {
    trips = await prisma.trip.findMany({
      where: {
        customerId: userId,
        paymentReference: { not: null }, // Only trips with payment references
      },
      skip: Number.parseInt(offset),
      take: Number.parseInt(limit),
      orderBy: { createdAt: "desc" },
      include: {
        rideComplete: true,
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    })
  } else if (userType === "DRIVER") {
    trips = await prisma.trip.findMany({
      where: {
        driverId: userId,
        paymentReference: { not: null }, // Only trips with payment references
      },
      skip: Number.parseInt(offset),
      take: Number.parseInt(limit),
      orderBy: { createdAt: "desc" },
      include: {
        rideComplete: true,
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    })
  }

  // For each trip, get the payment details based on the gateway
  const paymentDetails = await Promise.all(
    trips.map(async (trip) => {
      if (trip.paymentReference) {
        try {
          if (trip.paymentGateway === "PAYPACK") {
            // For PayPack, we might not have direct payment details
            return {
              trip,
              payment: {
                status: trip.paymentStatus,
                method: trip.paymentMethod,
                reference: trip.paymentReference,
              },
              gateway: "PAYPACK",
            }
          } else if (trip.paymentGateway === "SIMPLE") {
            // For simple payments, get from our database
            const payment = await prisma.payment.findFirst({
              where: { tripId: trip.id },
            })

            return {
              trip,
              payment: payment || null,
              gateway: "SIMPLE",
            }
          }
        } catch (error) {
          console.error(`Error fetching payment details for trip ${trip.id}:`, error)
          return { trip, payment: null, gateway: trip.paymentGateway }
        }
      }
      return { trip, payment: null, gateway: null }
    }),
  )

  return paymentDetails
}

/**
 * Process a refund
 * @param {String} customerId - Customer ID
 * @param {Number} amount - Refund amount
 * @param {String} phoneNumber - Customer phone number
 * @param {String} tripId - Trip ID
 * @param {String} reason - Refund reason
 * @returns {Promise<Object>} - Refund response
 */
export const processRefund = async (customerId, amount, phoneNumber, tripId, reason) => {
  // Verify trip exists and belongs to customer
  const trip = await prisma.trip.findUnique({
    where: {
      id: tripId,
      customerId,
    },
    include: {
      rideComplete: true,
    },
  })

  if (!trip) {
    throw new Error("Trip not found or does not belong to this customer")
  }

  // Check if trip is eligible for refund
  if (trip.status === "COMPLETED" && trip.rideComplete) {
    throw new Error("Completed trips are not eligible for refund")
  }

  let refundResponse

  if (trip.paymentGateway === "PAYPACK") {
    // Process refund through PayPack
    refundResponse = await processPaypackRefund(amount, phoneNumber)
  } else if (trip.paymentGateway === "SIMPLE") {
    // Generate a unique refund reference
    const refundReference = `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Create a refund record
    const refund = await prisma.refund.create({
      data: {
        reference: refundReference,
        amount,
        reason: reason || "Customer requested refund",
        status: "SUCCESS",
        tripId,
        customerId,
      },
    })

    refundResponse = {
      success: true,
      data: {
        refundReference,
        amount,
        status: "SUCCESS",
        createdAt: refund.createdAt,
      },
    }
  } else {
    throw new Error("Unknown payment gateway for this trip")
  }

  // Create a ride cancel record if trip is being canceled
  if (trip.status !== "CANCELED") {
    await prisma.rideCancel.create({
      data: {
        tripId: trip.id,
        canceledByType: "CUSTOMER",
        canceledById: customerId,
        reason: reason || "Refund requested by customer",
        canceledAt: new Date(),
      },
    })

    // Update trip status
    await prisma.trip.update({
      where: { id: tripId },
      data: {
        status: "CANCELED",
        paymentStatus: "REFUNDED",
      },
    })
  }

  // Update customer wallet if needed
  const wallet = await prisma.wallet.findUnique({
    where: { customerId },
  })

  if (wallet) {
    await prisma.wallet.update({
      where: { customerId },
      data: {
        balance: { increment: amount },
      },
    })
  }

  return refundResponse
}

/**
 * Get PayPack account information
 * @returns {Promise<Object>} - Account information
 */
export const getPaypackAccountInfo = async () => {
  return await getPaypackAccount()
}

