import { Cashin, Cashout, Transactions, Me } from './paypackApi.js';

const clientId = process.env.PAYPACK_CLIENT_ID;
const clientSecret = process.env.PAYPACK_CLIENT_SECRET;
const environment = process.env.NODE_ENV === 'production' ? 'production' : 'development';

export const processPayment = async (amount, phoneNumber) => {
  try {
    const response = await Cashin({
      number: phoneNumber,
      amount: amount,
      environment: environment,
      clientId: clientId,
      clientSecret: clientSecret,
    });
    return response;
  } catch (error) {
    console.error('Error processing payment:', error);
    throw new Error('Payment processing failed');
  }
};

export const processRefund = async (amount, phoneNumber) => {
  try {
    const response = await Cashout({
      number: phoneNumber,
      amount: amount,
      environment: environment,
      clientId: clientId,
      clientSecret: clientSecret,
    });
    return response;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw new Error('Refund processing failed');
  }
};

export const getTransactions = async (offset = 0, limit = 100) => {
  try {
    const response = await Transactions({ offset, limit, clientId: clientId, clientSecret: clientSecret });
    return response;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw new Error('Failed to fetch transactions');
  }
};

export const getAccountInfo = async () => {
  try {
    const response = await Me({ clientId: clientId, clientSecret: clientSecret });
    return response;
  } catch (error) {
    console.error('Error fetching account info:', error);
    throw new Error('Failed to fetch account info');
  }
};
