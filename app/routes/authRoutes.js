import express from 'express';
import {
  registerCustomer,
  registerDriver,
  loginCustomer,
  loginDriver,
  sendOTP,
  forgotPassword,
  resetPassword,
  verifyOTPDriver,
  verifyOTPcustomer,
} from '../controllers/authController.js';

const router = express.Router();

// Customer
router.post('/customer/register', registerCustomer);
router.post('/customer/login', loginCustomer);

// Driver
router.post('/driver/register', registerDriver);
router.post('/driver/login', loginDriver);

// OTP
router.post('/verify-otp-customer', verifyOTPcustomer);
router.post('/verify-otp-driver', verifyOTPDriver);

// Password reset
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
