import axios from "axios"

// Set the base URL based on environment
const BASE_URL =
  process.env.NODE_ENV === "production" ? "https://api.irembopay.com" : "https://api.sandbox.irembopay.com"

// Create axios instance with default headers
const iremboPayClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-API-Version": "2",
    "irembopay-secretkey": process.env.IREMBOPAY_SECRET_KEY,
  },
})

/**
 * Create an invoice in IremboPay
 * @param {Object} invoiceData - Invoice data
 * @returns {Promise<Object>} - Created invoice
 */
export const createInvoice = async (invoiceData) => {
  try {
    const response = await iremboPayClient.post("/payments/invoices", invoiceData)
    return response.data
  } catch (error) {
    console.error("Error creating IremboPay invoice:", error.response?.data || error.message)
    throw new Error(error.response?.data?.message || "Failed to create IremboPay invoice")
  }
}

/**
 * Get invoice details from IremboPay
 * @param {String} invoiceNumber - Invoice number
 * @returns {Promise<Object>} - Invoice details
 */
export const getInvoice = async (invoiceNumber) => {
  try {
    const response = await iremboPayClient.get(`/payments/invoices/${invoiceNumber}`)
    return response.data
  } catch (error) {
    console.error("Error fetching IremboPay invoice:", error.response?.data || error.message)
    throw new Error(error.response?.data?.message || "Failed to fetch IremboPay invoice")
  }
}

/**
 * Update an invoice in IremboPay
 * @param {String} invoiceNumber - Invoice number
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} - Updated invoice
 */
export const updateInvoice = async (invoiceNumber, updateData) => {
  try {
    const response = await iremboPayClient.put(`/payments/invoices/${invoiceNumber}`, updateData)
    return response.data
  } catch (error) {
    console.error("Error updating IremboPay invoice:", error.response?.data || error.message)
    throw new Error(error.response?.data?.message || "Failed to update IremboPay invoice")
  }
}

/**
 * Create a batch invoice in IremboPay
 * @param {Object} batchData - Batch invoice data
 * @returns {Promise<Object>} - Created batch invoice
 */
export const createBatchInvoice = async (batchData) => {
  try {
    const response = await iremboPayClient.post("/payments/invoices/batch", batchData)
    return response.data
  } catch (error) {
    console.error("Error creating IremboPay batch invoice:", error.response?.data || error.message)
    throw new Error(error.response?.data?.message || "Failed to create IremboPay batch invoice")
  }
}

/**
 * Initiate mobile money push payment
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object>} - Payment initiation response
 */
export const initiateMobilePayment = async (paymentData) => {
  try {
    const response = await iremboPayClient.post("/payments/transactions/initiate", paymentData)
    return response.data
  } catch (error) {
    console.error("Error initiating mobile payment:", error.response?.data || error.message)
    throw new Error(error.response?.data?.message || "Failed to initiate mobile payment")
  }
}

/**
 * Verify IremboPay webhook signature
 * @param {String} signature - Signature from header
 * @param {String} timestamp - Timestamp from header
 * @param {Object} payload - Request body
 * @returns {Boolean} - Whether signature is valid
 */
export const verifyWebhookSignature = (signature, timestamp, payload) => {
  const crypto = require("crypto")

  // Create the payload to hash (timestamp + "#" + JSON payload)
  const payloadToHash = `${timestamp}#${JSON.stringify(payload)}`

  // Compute HMAC with SHA256
  const computedSignature = crypto
    .createHmac("sha256", process.env.IREMBOPAY_SECRET_KEY)
    .update(payloadToHash)
    .digest("hex")

  // Compare signatures
  return computedSignature === signature
}

