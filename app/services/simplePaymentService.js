import prisma from "../configs/prisma.js"

/**
 * Record a payment in the database
 * @param {String} customerId - Customer ID
 * @param {Number} amount - Payment amount
 * @param {String} phoneNumber - Customer phone number
 * @param {String} description - Payment description
 * @param {String} tripId - Trip ID
 * @param {String} paymentMethod - Payment method (MOMO, CARD, CASH)
 * @returns {Promise<Object>} - Payment record
 */
export const recordPayment = async (customerId, amount, phoneNumber, description, tripId, paymentMethod) => {
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

  // Generate a unique payment reference
  const paymentReference = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`

  // Update the trip with payment information
  const updatedTrip = await prisma.trip.update({
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

  return {
    success: true,
    data: {
      paymentReference,
      amount,
      status: "SUCCESS",
      method: paymentMethod,
      createdAt: payment.createdAt,
    },
  }
}

/**
 * Get payment history for a user
 * @param {String} userId - User ID
 * @param {String} userType - User type (CUSTOMER or DRIVER)
 * @param {Number} offset - Pagination offset
 * @param {Number} limit - Pagination limit
 * @returns {Promise<Object>} - Payment history
 */
export const getPaymentHistory = async (userId, userType, offset = 0, limit = 10) => {
  let payments = []

  if (userType === "CUSTOMER") {
    payments = await prisma.payment.findMany({
      where: { customerId: userId },
      skip: Number.parseInt(offset),
      take: Number.parseInt(limit),
      orderBy: { createdAt: "desc" },
      include: {
        trip: {
          include: {
            driver: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    })
  } else if (userType === "DRIVER") {
    // Get all trips for this driver
    const driverTrips = await prisma.trip.findMany({
      where: { driverId: userId },
      select: { id: true },
    })

    const tripIds = driverTrips.map((trip) => trip.id)

    payments = await prisma.payment.findMany({
      where: {
        tripId: { in: tripIds },
      },
      skip: Number.parseInt(offset),
      take: Number.parseInt(limit),
      orderBy: { createdAt: "desc" },
      include: {
        trip: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    })
  }

  return payments
}

/**
 * Process a refund
 * @param {String} customerId - Customer ID
 * @param {Number} amount - Refund amount
 * @param {String} tripId - Trip ID
 * @param {String} reason - Refund reason
 * @returns {Promise<Object>} - Refund response
 */
export const processRefund = async (customerId, amount, tripId, reason) => {
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

  // Create notifications
  await prisma.notification.create({
    data: {
      customerId,
      title: "Refund Processed",
      message: `Your refund of ${amount} RWF for trip ${tripId} was processed successfully.`,
      isRead: false,
    },
  })

  if (trip.driverId) {
    await prisma.notification.create({
      data: {
        driverId: trip.driverId,
        title: "Trip Refunded",
        message: `A refund of ${amount} RWF for trip ${tripId} was processed.`,
        isRead: false,
      },
    })
  }

  return {
    success: true,
    data: {
      refundReference,
      amount,
      status: "SUCCESS",
      createdAt: refund.createdAt,
    },
  }
}

