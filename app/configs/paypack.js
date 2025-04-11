require('dotenv').config(); 

const PaypackJs = require('paypack-js').default; 

let paypackClient = null;


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


const processCashIn = async (amount, phoneNumber) => {
  if (!paypackClient) {
    await initPaypack();
  }

  try {
    const environment = process.env.NODE_ENV === "production" ? "production" : "development";
    const response = await paypackClient.cashin({
      number: phoneNumber, 
      amount: amount, 
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


const processCashOut = async (amount, driverPhoneNumber) => {
  if (!paypackClient) {
    await initPaypack();
  }

  try {
    const environment = process.env.NODE_ENV === "production" ? "production" : "development";
    const response = await paypackClient.cashout({
      number: driverPhoneNumber, 
      amount: amount, 
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


const handlePaymentFlow = async (amount, customerPhoneNumber, driverPhoneNumber) => {
  try {
    
    const cashInSuccess = await processCashIn(amount, customerPhoneNumber);
    if (!cashInSuccess) {
      console.log("Payment from customer failed. Ending process.");
      return;
    }

    
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
