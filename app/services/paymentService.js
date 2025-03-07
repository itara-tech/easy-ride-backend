import paypackClient from '../configs/paypack.js';

export const processPayment = async (amount, phoneNumber, description) => {
  try {
    const response = await paypackClient.post('/payments', {
      amount,
      phoneNumber,
      description,
    });

    return response.data;
  } catch (error) {
    console.error('Error processing payment:', error);
    throw new Error('Payment processing failed');
  }
};

export const checkPaymentStatus = async (transactionId) => {
  try {
    const response = await paypackClient.get(`/payments/${transactionId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw new Error('Failed to check payment status');
  }
};
