import { createRequire } from "module";
const require = createRequire(import.meta.url);

let paypackClient = null;

export const initPaypack = async () => {
  try {
    const PaypackJs = require("paypack-js").default;
    
    paypackClient = new PaypackJs({
      client_id: process.env.PAYPACK_CLIENT_ID,
      client_secret: process.env.PAYPACK_CLIENT_SECRET,
    });

    console.log(`PayPack initialized with client ID: ${process.env.PAYPACK_CLIENT_ID}`);
    return true;
  } catch (error) {
    console.error("Error initializing PayPack:", error);
    return false;
  }
};

export const processPaypackPayment = async (amount, phoneNumber, description) => {
  if (!paypackClient) await initPaypack();

  try {
    const environment = process.env.NODE_ENV === "production" ? "production" : "development";
    
    const response = await paypackClient.cashin({
      number: phoneNumber,
      amount: amount,
      environment: environment,
    });

    return {
      success: true,
      data: response.data,
      status: response.data.status,
    };
  } catch (error) {
    console.error("PayPack payment error:", error);
    throw new Error("Payment processing failed: " + error.message);
  }
};

export const processPaypackRefund = async (amount, phoneNumber) => {
  if (!paypackClient) await initPaypack();

  try {
    const environment = process.env.NODE_ENV === "production" ? "production" : "development";
    
    const response = await paypackClient.cashout({
      number: phoneNumber,
      amount: amount,
      environment: environment,
    });

    return {
      success: true,
      data: response.data,
      status: response.data.status,
    };
  } catch (error) {
    console.error("PayPack refund error:", error);
    throw new Error("Refund processing failed: " + error.message);
  }
};

export const checkPaypackTransactionStatus = async (reference) => {
  if (!paypackClient) await initPaypack();

  try {
    // First check events
    const eventsResponse = await paypackClient.events({ offset: 0, limit: 100 });
    const event = eventsResponse.data.transactions.find(t => t.data?.ref === reference);
    
    if (event) {
      return {
        success: true,
        data: event.data,
        status: event.data.status,
        source: "events"
      };
    }

    // Then check transactions
    const transactionsResponse = await paypackClient.transactions({ offset: 0, limit: 100 });
    const transaction = transactionsResponse.data.transactions.find(t => t.ref === reference);
    
    if (transaction) {
      return {
        success: true,
        data: transaction,
        status: transaction.status,
        source: "transactions"
      };
    }

    throw new Error("Transaction not found");
  } catch (error) {
    console.error("PayPack status check error:", error);
    throw new Error("Failed to check transaction status: " + error.message);
  }
};

export const getPaypackAccount = async () => {
  if (!paypackClient) await initPaypack();

  try {
    const response = await paypackClient.me();
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("PayPack account info error:", error);
    throw new Error("Failed to get account information: " + error.message);
  }
};