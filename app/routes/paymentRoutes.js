import express from "express"
import { authenticate, isCustomer } from "../middleware/auth.js"
import {
  createPayment,
  getPaymentHistory,
  refundPayment,
  getPaymentStatus,
  getAccountDetails,
} from "../controllers/paymentController.js"

const router = express.Router()

// Create a new payment (works with all gateways)
router.post("/create", authenticate, isCustomer, createPayment)

// Get payment history (works with all gateways)
router.get("/history", authenticate, getPaymentHistory)

// Process a refund (works with all gateways)
router.post("/refund", authenticate, isCustomer, refundPayment)

// Check payment status (works with all gateways)
router.get("/status/:reference", authenticate, getPaymentStatus)

// Account information
router.get("/account", authenticate, getAccountDetails)

export default router

