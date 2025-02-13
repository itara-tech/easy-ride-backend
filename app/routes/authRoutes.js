import express from "express"
import {
    registerCustomer,
    registerDriver,
    loginCustomer,
    loginDriver,
    sendOTP,
    verifyOTP,
    forgotPassword,
    resetPassword
} from "../controllers/authController.js"

const router = express.Router()

// Customer 
router.post("/customer/register", registerCustomer)
router.post("/customer/login", loginCustomer)

// Driver 
router.post("/driver/register", registerDriver)
router.post("/driver/login", loginDriver)

// OTP  
router.post("/send-otp", sendOTP)
router.post("/verify-otp", verifyOTP)

// Password reset
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)

export default router