import express from "express"
import { createPayment, getPaymentStatus, updatePaymentStatus } from "../controllers/paymentController.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

router.post("/", authenticateToken, createPayment)
router.get("/:id", authenticateToken, getPaymentStatus)
router.put("/:id", authenticateToken, updatePaymentStatus)

export default router

