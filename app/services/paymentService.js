import prisma from '../configs/database.js';
import {
  processPaypackPayment,
  processPaypackRefund,
  checkPaypackTransactionStatus,
  getPaypackAccount,
} from './paypackService.js';

export const createPaymentTransaction = async (
  customerId,
  amount,
  phoneNumber,
  description,
  tripId,
  paymentGateway = 'simple',
  paymentMethod = null,
) => {
  // Validate trip exists and belongs to customer
  const trip = await prisma.trip.findUnique({
    where: {
      id: tripId,
      customerId,
    },
  });

  if (!trip) {
    throw new Error('Trip not found or does not belong to this customer');
  }

  // Get customer details
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { name: true, email: true, phone: true },
  });

  let paymentResponse;

  // Process payment based on gateway
  if (paymentGateway.toLowerCase() === 'paypack') {
    // Validate phone number for mobile money
    if (!phoneNumber || !phoneNumber.startsWith('07')) {
      throw new Error('Valid MTN mobile money number (07XXXXXXXX) required for PayPack payments');
    }

    // Process PayPack mobile money payment
    paymentResponse = await processPaypackPayment(amount, phoneNumber, description);

    // Store payment reference in database
    if (paymentResponse.success) {
      const paymentReference = paymentResponse.data.ref;

      await prisma.trip.update({
        where: { id: tripId },
        data: {
          paymentReference,
          paymentGateway: 'PAYPACK',
          paymentStatus: paymentResponse.data.status.toUpperCase(),
          paymentMethod: 'MOMO',
        },
      });

      // Create payment record
      await prisma.payment.create({
        data: {
          reference: paymentReference,
          amount,
          phoneNumber,
          description: description || `PayPack payment for trip ${tripId}`,
          method: 'MOMO',
          status: paymentResponse.data.status.toUpperCase(),
          tripId,
          customerId,
        },
      });

      // Update wallet if payment succeeded immediately
      if (paymentResponse.data.status === 'successful') {
        await updateWalletBalance(customerId, -amount);

        // Create payment success notification
        await createPaymentNotification(customerId, trip.driverId, tripId, amount, true);
      }
    }
  } else if (paymentGateway.toLowerCase() === 'simple') {
    // Validate payment method for simple payments
    if (!paymentMethod || !['MOMO', 'CARD', 'CASH'].includes(paymentMethod)) {
      throw new Error('Invalid payment method. Must be MOMO, CARD, or CASH');
    }

    const paymentReference = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Update trip with payment info
    await prisma.trip.update({
      where: { id: tripId },
      data: {
        paymentReference,
        paymentMethod,
        paymentStatus: 'SUCCESS',
        paymentGateway: 'SIMPLE',
      },
    });

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        reference: paymentReference,
        amount,
        phoneNumber,
        description: description || `Payment for trip ${tripId}`,
        method: paymentMethod,
        status: 'SUCCESS',
        tripId,
        customerId,
      },
    });

    // Update wallet
    await updateWalletBalance(customerId, -amount);

    // Create notifications
    await createPaymentNotification(customerId, trip.driverId, tripId, amount, true);

    paymentResponse = {
      success: true,
      data: {
        paymentReference,
        amount,
        status: 'SUCCESS',
        method: paymentMethod,
        createdAt: payment.createdAt,
      },
    };
  } else {
    throw new Error('Invalid payment gateway. Must be paypack or simple');
  }

  return paymentResponse;
};

export const checkPaymentStatus = async (reference, paymentGateway = 'simple') => {
  let response;

  if (paymentGateway.toLowerCase() === 'paypack') {
    try {
      const statusResponse = await checkPaypackTransactionStatus(reference);

      // Find the trip associated with this payment
      const trip = await prisma.trip.findFirst({
        where: { paymentReference: reference },
      });

      // Update trip status if changed
      if (trip && trip.paymentStatus !== statusResponse.data.status.toUpperCase()) {
        await prisma.trip.update({
          where: { id: trip.id },
          data: {
            paymentStatus: statusResponse.data.status.toUpperCase(),
          },
        });

        // Update payment record status
        await prisma.payment.updateMany({
          where: { reference },
          data: {
            status: statusResponse.data.status.toUpperCase(),
          },
        });

        // If payment just succeeded, update wallet and notify
        if (statusResponse.data.status === 'successful' && trip.paymentStatus !== 'SUCCESS') {
          await updateWalletBalance(trip.customerId, -statusResponse.data.amount);
          await createPaymentNotification(trip.customerId, trip.driverId, trip.id, statusResponse.data.amount, true);
        }
      }

      response = {
        success: true,
        data: {
          reference,
          status: statusResponse.data.status,
          amount: statusResponse.data.amount,
          createdAt: statusResponse.data.created_at,
          updatedAt: new Date().toISOString(),
        },
        gateway: 'PAYPACK',
      };
    } catch (error) {
      response = {
        success: false,
        message: error.message,
        gateway: 'PAYPACK',
      };
    }
  } else if (paymentGateway.toLowerCase() === 'simple') {
    // Simple payment status check (from database)
    const payment = await prisma.payment.findUnique({
      where: { reference },
    });

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
        gateway: 'SIMPLE',
      };
    } else {
      response = {
        success: false,
        message: 'Payment not found',
        gateway: 'SIMPLE',
      };
    }
  } else {
    throw new Error('Invalid payment gateway. Must be paypack or simple');
  }

  return response;
};

export const getUserPaymentHistory = async (userId, userType, offset = 0, limit = 10) => {
  let trips = [];

  if (userType === 'CUSTOMER') {
    trips = await prisma.trip.findMany({
      where: {
        customerId: userId,
        paymentReference: { not: null },
      },
      skip: Number(offset),
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        rideComplete: true,
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        payments: true,
        refunds: true,
      },
    });
  } else if (userType === 'DRIVER') {
    trips = await prisma.trip.findMany({
      where: {
        driverId: userId,
        paymentReference: { not: null },
      },
      skip: Number(offset),
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        rideComplete: true,
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        payments: true,
        refunds: true,
      },
    });
  }

  // Format response with payment details
  const paymentHistory = trips.map((trip) => ({
    tripId: trip.id,
    amount: trip.payments?.[0]?.amount || trip.estimatedPrice,
    status: trip.paymentStatus,
    method: trip.paymentMethod,
    gateway: trip.paymentGateway,
    reference: trip.paymentReference,
    createdAt: trip.payments?.[0]?.createdAt || trip.createdAt,
    driver: trip.driver,
    customer: trip.customer,
    refunds: trip.refunds,
  }));

  return paymentHistory;
};

export const processRefund = async (customerId, amount, phoneNumber, tripId, reason) => {
  // Verify trip exists and belongs to customer
  const trip = await prisma.trip.findUnique({
    where: {
      id: tripId,
      customerId,
    },
    include: {
      rideComplete: true,
      payments: true,
    },
  });

  if (!trip) {
    throw new Error('Trip not found or does not belong to this customer');
  }

  if (trip.status === 'COMPLETED' && trip.rideComplete) {
    throw new Error('Completed trips are not eligible for refund');
  }

  let refundResponse;

  if (trip.paymentGateway === 'PAYPACK') {
    if (!phoneNumber || !phoneNumber.startsWith('07')) {
      throw new Error('Valid MTN mobile money number (07XXXXXXXX) required for PayPack refunds');
    }
    refundResponse = await processPaypackRefund(amount, phoneNumber);

    if (refundResponse.success) {
      // Create refund record
      await prisma.refund.create({
        data: {
          reference: refundResponse.data.ref,
          amount,
          reason: reason || 'Customer requested refund',
          status: refundResponse.data.status.toUpperCase(),
          tripId,
          customerId,
        },
      });

      // Update trip status
      await prisma.trip.update({
        where: { id: tripId },
        data: {
          status: 'CANCELED',
          paymentStatus: 'REFUNDED',
        },
      });

      // Update wallet if refund succeeded immediately
      if (refundResponse.data.status === 'successful') {
        await updateWalletBalance(customerId, amount);

        // Create refund notification
        await prisma.notification.create({
          data: {
            customerId,
            title: 'Refund Processed',
            message: `Your refund of ${amount} RWF for trip ${tripId} was processed.`,
            isRead: false,
          },
        });
      }
    }
  } else if (trip.paymentGateway === 'SIMPLE') {
    const refundReference = `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create refund record
    const refund = await prisma.refund.create({
      data: {
        reference: refundReference,
        amount,
        reason: reason || 'Customer requested refund',
        status: 'SUCCESS',
        tripId,
        customerId,
      },
    });

    // Update trip status
    await prisma.trip.update({
      where: { id: tripId },
      data: {
        status: 'CANCELED',
        paymentStatus: 'REFUNDED',
      },
    });
    await updateWalletBalance(customerId, amount);
    await prisma.notification.create({
      data: {
        customerId,
        title: 'Refund Processed',
        message: `Your refund of ${amount} RWF for trip ${tripId} was processed.`,
        isRead: false,
      },
    });
    if (trip.driverId) {
      await prisma.notification.create({
        data: {
          driverId: trip.driverId,
          title: 'Payment Refunded',
          message: `Payment of ${amount} RWF for trip ${tripId} was refunded to customer.`,
          isRead: false,
        },
      });
    }

    refundResponse = {
      success: true,
      data: {
        refundReference,
        amount,
        status: 'SUCCESS',
        createdAt: refund.createdAt,
      },
    };
  } else {
    throw new Error('Unknown payment gateway for this trip');
  }

  return refundResponse;
};

export const getPaypackAccountInfo = async () => {
  return await getPaypackAccount();
};
async function updateWalletBalance(customerId, amount) {
  const wallet = await prisma.wallet.findUnique({
    where: { customerId },
  });

  if (wallet) {
    await prisma.wallet.update({
      where: { customerId },
      data: {
        balance: { increment: amount },
      },
    });
  }
}
async function createPaymentNotification(customerId, driverId, tripId, amount, isSuccess) {
  const status = isSuccess ? 'successful' : 'failed';
  const message = isSuccess
    ? `Your payment of ${amount} RWF for trip ${tripId} was successful.`
    : `Your payment of ${amount} RWF for trip ${tripId} failed.`;

  await prisma.notification.create({
    data: {
      customerId,
      title: `Payment ${status}`,
      message,
      isRead: false,
    },
  });

  if (driverId && isSuccess) {
    await prisma.notification.create({
      data: {
        driverId,
        title: 'Payment Received',
        message: `Payment of ${amount} RWF for trip ${tripId} was received.`,
        isRead: false,
      },
    });
  }
}

export const exportUserPaymentHistory = async (userId, userType) => {
  try {
    // Get all payments for the user (no pagination for export)
    const payments = await getUserPaymentHistory(userId, userType, 0, 10000);

    // Create new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payment History');

    // Add headers
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 20 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Gateway', key: 'gateway', width: 15 },
      { header: 'Reference', key: 'reference', width: 30 },
      { header: 'Description', key: 'description', width: 40 },
    ];

    // Add data rows
    payments.forEach((payment) => {
      worksheet.addRow({
        date: payment.createdAt,
        amount: payment.amount,
        type: userType === 'CUSTOMER' ? 'Payment' : 'Earning',
        status: payment.status,
        gateway: payment.gateway,
        reference: payment.reference,
        description: payment.description || 'No description',
      });
    });

    // Style header row
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    return workbook;
  } catch (error) {
    console.error('Export error:', error);
    throw new Error('Failed to export payment history');
  }
};

/**
 * Verify payment webhook
 */
export const verifyPaymentWebhook = async (payload) => {
  try {
    // Verify PayPack webhook signature if needed
    // Add your verification logic here

    // Example for PayPack webhook verification
    if (payload.event === 'transaction:processed') {
      const transaction = payload.data;

      // Update payment status in database
      await prisma.payment.updateMany({
        where: { reference: transaction.ref },
        data: { status: transaction.status.toUpperCase() },
      });

      return { success: true, message: 'Webhook processed' };
    }

    return { success: false, message: 'Unsupported webhook event' };
  } catch (error) {
    console.error('Webhook verification error:', error);
    throw error;
  }
};
