import { createRequire } from "module"


const require = createRequire(import.meta.url)


let paypackClient = null


export const initPaypack = async () => {
  try {
    // Dynamically import PayPack
    const PaypackJs = require("paypack-js").default

    paypackClient = new PaypackJs({
      client_id: process.env.PAYPACK_CLIENT_ID,
      client_secret: process.env.PAYPACK_CLIENT_SECRET,
    })

    console.log(paypackClient);
    

    return true
  } catch (error) {
    console.error("Error initializing PayPack:", error)
    return false
  }
}

export const processPayment = async (amount, phoneNumber, description) => {
  if (!paypackClient) {
    await initPaypack()
  }

  try {
    const environment = process.env.NODE_ENV === "production" ? "production" : "development"

    const response = await paypackClient.cashin({
      number: phoneNumber,
      amount: amount,
      environment: environment,
    })

    return {
      success: true,
      data: response.data,
      status: response.data.status,
    }
  } catch (error) {
    console.error("Error processing PayPack payment:", error)
    throw new Error("Payment processing failed: " + (error.message || "Unknown error"))
  }
}

export const processRefund = async (amount, phoneNumber) => {
  if (!paypackClient) {
    await initPaypack()
  }

  try {
    const environment = process.env.NODE_ENV === "production" ? "production" : "development"

    const response = await paypackClient.cashout({
      number: phoneNumber,
      amount: amount,
      environment: environment,
    })

    return {
      success: true,
      data: response.data,
      status: response.data.status,
    }
  } catch (error) {
    console.error("Error processing PayPack refund:", error)
    throw new Error("Refund processing failed: " + (error.message || "Unknown error"))
  }
}


export const getTransactions = async (offset = 0, limit = 100) => {
  if (!paypackClient) {
    await initPaypack()
  }

  try {
    const response = await paypackClient.transactions({
      offset: offset,
      limit: limit,
    })

    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    console.error("Error fetching PayPack transactions:", error)
    throw new Error("Failed to fetch transactions: " + (error.message || "Unknown error"))
  }
}


export const getEvents = async (offset = 0, limit = 100) => {
  if (!paypackClient) {
    await initPaypack()
  }

  try {
    const response = await paypackClient.events({
      offset: offset,
      limit: limit,
    })

    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    console.error("Error fetching PayPack events:", error)
    throw new Error("Failed to fetch events: " + (error.message || "Unknown error"))
  }
}


export const getAccountInfo = async () => {
  if (!paypackClient) {
    await initPaypack()
  }

  try {
    const response = await paypackClient.me()

    return {
      success: true,
      data: response.data,
    }
  } catch (error) {
    console.error("Error fetching PayPack account info:", error)
    throw new Error("Failed to fetch account information: " + (error.message || "Unknown error"))
  }
}

