import {
  createPaymentTransaction,
  getUserPaymentHistory,
  processRefund,
  checkPaymentStatus,
  getPaypackAccountInfo,
  verifyPaymentWebhook,
  exportUserPaymentHistory,
} from "../services/paymentService.js";
import { initPaypack } from "../services/paypackService.js";
import { validationResult } from "express-validator";


initPaypack().then((success) => {
  console.log(success ? "PayPack initialized successfully" : "Failed to initialize PayPack");
});

/**
 * Create a new payment
 */
export const createPayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { amount, phoneNumber, description, tripId, paymentGateway = "simple", paymentMethod } = req.body;
    const customerId = req.user.id;

    const paymentResponse = await createPaymentTransaction(
      customerId,
      amount,
      phoneNumber,
      description,
      tripId,
      paymentGateway,
      paymentMethod
    );

    return res.status(201).json({
      success: true,
      message: "Payment initiated successfully",
      data: paymentResponse.data,
      gateway: paymentGateway,
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to initiate payment",
      error: error.message,
    });
  }
};

/**
 * Verify payment (webhook)
 */
export const verifyPayment = async (req, res) => {
  try {
    const result = await verifyPaymentWebhook(req.body);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(400).json({
      success: false,
      message: "Invalid webhook payload",
    });
  }
};

/**
 * Get payment history
 */
export const getPaymentHistory = async (req, res) => {
  try {
    const { offset = 0, limit = 10, status, gateway } = req.query;
    const userId = req.user.id;
    const userType = req.user.type;

    const history = await getUserPaymentHistory(
      userId,
      userType,
      Number(offset),
      Number(limit),
      status,
      gateway
    );

    return res.status(200).json({
      success: true,
      message: "Payment history retrieved",
      data: history,
    });
  } catch (error) {
    console.error("Payment history error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve payment history",
      error: error.message,
    });
  }
};

/**
 * Export payment history
 */
export const exportPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.type;
    
    const result = await exportUserPaymentHistory(userId, userType);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=payments_${userId}.xlsx`);
    
    return result.xlsx.write(res).then(() => {
      res.status(200).end();
    });
  } catch (error) {
    console.error("Export error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to export payment history",
      error: error.message,
    });
  }
};

/**
 * Process refund
 */
export const refundPayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { amount, phoneNumber, tripId, reason } = req.body;
    const customerId = req.user.id;

    const refundResponse = await processRefund(
      customerId,
      amount,
      phoneNumber,
      tripId,
      reason
    );

    return res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      data: refundResponse,
    });
  } catch (error) {
    console.error("Refund error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process refund",
      error: error.message,
    });
  }
};

/**
 * Check payment status
 */
export const getPaymentStatus = async (req, res) => {
  try {
    const { reference } = req.params;
    const { gateway = "simple" } = req.query;

    const statusResponse = await checkPaymentStatus(reference, gateway);

    if (!statusResponse.success) {
      return res.status(404).json(statusResponse);
    }

    return res.status(200).json({
      success: true,
      message: "Payment status retrieved",
      data: statusResponse.data,
      gateway,
    });
  } catch (error) {
    console.error("Status check error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check payment status",
      error: error.message,
    });
  }
};

/**
 * Get account details
 */
export const getAccountDetails = async (req, res) => {
  try {
    const accountInfo = await getPaypackAccountInfo();

    return res.status(200).json({
      success: true,
      message: "Account information retrieved",
      data: accountInfo.data,
      gateway: "paypack",
    });
  } catch (error) {
    console.error("Account info error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve account information",
      error: error.message,
    });
  }
};