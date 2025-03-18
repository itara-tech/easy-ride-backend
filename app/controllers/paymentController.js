import {
  createPaymentTransaction,
  getUserPaymentHistory,
  processRefund,
  checkPaymentStatus,
  getPaypackAccountInfo,
} from "../services/paymentService.js"
import { initPaypack } from "../services/paypackService.js"

// Initialize PayPack when the server starts
initPaypack().then((success) => {
  if (success) {
    console.log("PayPack initialized successfully")
  } else {
    console.error("Failed to initialize PayPack")
  }
})

/**
 * Create a new payment
 */
export const createPayment = async (req, res) => {
  try {
    const { amount, phoneNumber, description, tripId, paymentGateway = "simple", paymentMethod } = req.body

    if (!amount || !tripId) {
      return res.status(400).json({
        success: false,
        message: "Amount and trip ID are required",
      })
    }

    // Get customer ID from authenticated user
    const customerId = req.user.id

    const paymentResponse = await createPaymentTransaction(
      customerId,
      amount,
      phoneNumber,
      description,
      tripId,
      paymentGateway,
      paymentMethod,
    )

    return res.status(200).json({
      success: true,
      message: "Payment initiated successfully",
      data: paymentResponse.data,
      gateway: paymentGateway,
    })
  } catch (error) {
    console.error("Payment creation error:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to initiate payment",
      error: error.message,
    })
  }
}

/**
 * Check payment status
 */
export const getPaymentStatus = async (req, res) => {
  try {
    const { reference } = req.params
    const { gateway = "simple" } = req.query

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "Payment reference is required",
      })
    }

    const statusResponse = await checkPaymentStatus(reference, gateway)

    return res.status(200).json({
      success: true,
      message: "Payment status retrieved successfully",
      data: statusResponse.data,
      gateway: gateway,
    })
  } catch (error) {
    console.error("Payment status check error:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to check payment status",
      error: error.message,
    })
  }
}

/**
 * Get payment history for a user
 */
export const getPaymentHistory = async (req, res) => {
  try {
    const { offset = 0, limit = 10 } = req.query
    const userId = req.user.id
    const userType = req.user.type // Assuming auth middleware sets user type

    const paymentHistory = await getUserPaymentHistory(userId, userType, offset, limit)

    return res.status(200).json({
      success: true,
      message: "Payment history retrieved successfully",
      data: paymentHistory,
    })
  } catch (error) {
    console.error("Payment history retrieval error:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve payment history",
      error: error.message,
    })
  }
}

/**
 * Process a refund
 */
export const refundPayment = async (req, res) => {
  try {
    const { amount, phoneNumber, tripId, reason } = req.body

    if (!amount || !tripId) {
      return res.status(400).json({
        success: false,
        message: "Amount and trip ID are required",
      })
    }

    // Get customer ID from authenticated user
    const customerId = req.user.id

    const refundResponse = await processRefund(customerId, amount, phoneNumber, tripId, reason)

    return res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      data: refundResponse,
    })
  } catch (error) {
    console.error("Refund processing error:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to process refund",
      error: error.message,
    })
  }
}

/**
 * Get account information (PayPack)
 */
export const getAccountDetails = async (req, res) => {
  try {
    const accountInfo = await getPaypackAccountInfo()

    return res.status(200).json({
      success: true,
      message: "Account information retrieved successfully",
      data: accountInfo.data,
      gateway: "paypack",
    })
  } catch (error) {
    console.error("Account info retrieval error:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve account information",
      error: error.message,
    })
  }
}

