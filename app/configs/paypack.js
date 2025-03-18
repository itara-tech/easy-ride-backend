require('dotenv').config(); 

const PaypackJs = require('paypack-js').default; // Import PayPack library

let paypackClient = null;

// Initialize PayPack with your credentials
const initPaypack = async () => {
  try {
    paypackClient = new PaypackJs({
      client_id: process.env.PAYPACK_CLIENT_ID,
      client_secret: process.env.PAYPACK_CLIENT_SECRET,
    });

    console.log("PayPack client initialized:", paypackClient);
    return true;
  } catch (error) {
    console.error("Error initializing PayPack:", error);
    return false;
  }
};

// Process Payment (Cash-in) from Customer
const processCashIn = async (amount, phoneNumber) => {
  if (!paypackClient) {
    await initPaypack();
  }

  try {
    const environment = process.env.NODE_ENV === "production" ? "production" : "development";
    const response = await paypackClient.cashin({
      number: phoneNumber, // Customer phone number
      amount: amount, // Amount to be paid by customer
      environment: environment,
    });

    if (response.data.status === "success") {
      console.log(`Payment successful from customer: ${phoneNumber}, amount: ${amount}`);
      return true;
    } else {
      console.error(`Payment failed for customer: ${phoneNumber}`);
      return false;
    }
  } catch (error) {
    console.error("Error processing Cash-in:", error);
    throw new Error("Payment processing failed: " + (error.message || "Unknown error"));
  }
};

// Process Cash-out (transfer money to driver)
const processCashOut = async (amount, driverPhoneNumber) => {
  if (!paypackClient) {
    await initPaypack();
  }

  try {
    const environment = process.env.NODE_ENV === "production" ? "production" : "development";
    const response = await paypackClient.cashout({
      number: driverPhoneNumber, // Driver phone number
      amount: amount, // Amount to be transferred to driver
      environment: environment,
    });

    if (response.data.status === "success") {
      console.log(`Payment successfully transferred to driver: ${driverPhoneNumber}, amount: ${amount}`);
      return true;
    } else {
      console.error(`Cash-out failed for driver: ${driverPhoneNumber}`);
      return false;
    }
  } catch (error) {
    console.error("Error processing Cash-out:", error);
    throw new Error("Cash-out processing failed: " + (error.message || "Unknown error"));
  }
};

// Function to handle the entire payment flow
const handlePaymentFlow = async (amount, customerPhoneNumber, driverPhoneNumber) => {
  try {
    // Step 1: Customer pays (Cash-in)
    const cashInSuccess = await processCashIn(amount, customerPhoneNumber);
    if (!cashInSuccess) {
      console.log("Payment from customer failed. Ending process.");
      return;
    }

    // Step 2: Transfer money to driver (Cash-out)
    const cashOutSuccess = await processCashOut(amount, driverPhoneNumber);
    if (!cashOutSuccess) {
      console.log("Cash-out to driver failed.");
      return;
    }

    console.log("Payment process complete. Customer paid and driver received payment.");
  } catch (error) {
    console.error("Error in payment flow:", error);
  }
};

module.exports = { handlePaymentFlow, processCashIn, processCashOut };
