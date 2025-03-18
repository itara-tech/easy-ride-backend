
declare interface invoiceDataType {}

/**
 * Initiate mobile money payment with IremboPay
 * @param {String} invoiceNumber - Invoice number
 * @param {String} phoneNumber - Phone number
 * @param {String} provider - Payment provider (MTN or AIRTEL)
 * @returns {Promise<Object>} - Payment initiation response
 */
export const initiateMobilePayment = async (invoiceNumber, phoneNumber, provider) => {
  // Validate provider
  if (!["MTN", "AIRTEL"].includes(provider)) {
    throw new Error("Invalid payment provider. Must be MTN or AIRTEL")
  }

  declare interface paymentDataType {}

/**
 * Check payment status
 * @param {String} reference - Payment reference (invoice number or payment ID)
 * @param {String} paymentGateway - Payment gateway used (irembopay, lemon, paypack, or simple)
 * @returns {Promise<Object>} - Payment status
 */
export const checkPaymentStatus = async (reference, paymentGateway = "irembopay") => {
  let response

  if (paymentGateway.toLowerCase() === "irembopay") {
    response = await getInvoice(reference)

    if (response.success) {
      const invoice = response.data

      // If invoice is paid, update our database
      if (invoice.paymentStatus === "PAID") {
        // Find the trip associated with this invoice
        const trip = await prisma.trip.findFirst({
          where: { paymentReference: reference },
        })

        if (trip) {
          await prisma.trip.update({
            where: { id: trip.id },
            data: {
              paymentStatus: "SUCCESS",
              paymentMethod: invoice.paymentMethod,
            },
          })

          // Update customer wallet if needed
          const wallet = await prisma.wallet.findUnique({
            where: { customerId: trip.customerId },
          })

          if (wallet) {
            await prisma.wallet.update({
              where: { customerId: trip.customerId },
              data: {
                balance: { decrement: invoice.amount },
              },
            })
          }
        }
      }
    }
  } else if (paymentGateway.toLowerCase() === "lemon") {
    response = await getLemonPayment(reference)

    if (response.success) {
      const payment = response.data

      // If payment is successful, update our database
      if (payment.status === "succeeded") {
        // Find the trip associated with this payment
        const trip = await prisma.trip.findFirst({
          where: { paymentReference: reference },
        })

        if (trip) {
          await prisma.trip.update({
            where: { id: trip.id },
            data: {
              paymentStatus: "SUCCESS",
              paymentMethod: payment.payment_method_type,
            },
          })

          // Update customer wallet if needed
          const wallet = await prisma.wallet.findUnique({
            where: { customerId: trip.customerId },
          })

          if (wallet) {
            await prisma.wallet.update({
              where: { customerId: trip.customerId },
              data: {
                balance: { decrement: payment.amount },
              },
            })
          }
        }
      }
    }
  } else if (paymentGateway.toLowerCase() === "paypack") {
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
    throw new Error("Invalid payment gateway. Must be irembopay, lemon, paypack, or simple")
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
          if (trip.paymentGateway === "IREMBOPAY") {
            const invoiceDetails = await getInvoice(trip.paymentReference)
            return {
              trip,
              payment: invoiceDetails.success ? invoiceDetails.data : null,
              gateway: "IREMBOPAY",
            }
          } else if (trip.paymentGateway === "LEMON") {
            const paymentDetails = await getLemonPayment(trip.paymentReference)
            return {
              trip,
              payment: paymentDetails.success ? paymentDetails.data : null,
              gateway: "LEMON",
            }
          } else if (trip.paymentGateway === "PAYPACK") {
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

  if (trip.paymentGateway === "IREMBOPAY") {
    // For IremboPay, we need to handle refunds differently
    // This would typically involve contacting IremboPay support or using a separate refund API
    // For now, we'll just mark it as refunded in our system

    refundResponse = {
      success: true,
      message: "Refund request submitted to IremboPay",
      status: "pending",
    }
  } else if (trip.paymentGateway === "LEMON") {
    // Process refund through Lemon
    declare interface refundDataType {}
