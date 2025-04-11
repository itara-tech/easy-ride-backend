import express from 'express';
import { authenticate, isCustomer } from '../middleware/auth.js';
import {
  createPayment,
  getPaymentHistory,
  refundPayment,
  getPaymentStatus,
  getAccountDetails,
  verifyPayment,
  exportPaymentHistory,
} from '../controllers/paymentController.js';
import {
  validatePayment,
  validateRefund,
  validateStatusCheck,
  validatePaymentHistory,
  validateWebhook,
} from '../validators/paymentValidator.js';

const router = express.Router();

// Payment creation
router.post('/create', authenticate, (req, res, next) => validatePayment(req.body, res, next), createPayment);

// Payment verification (webhook)
router.post('/verify', (req, res, next) => validateWebhook(req.body, res, next), verifyPayment);

// Get payment history
router.get(
  '/history',
  authenticate,
  (req, res, next) => validatePaymentHistory(req.query, res, next),
  getPaymentHistory,
);

// Export payment history
router.get('/history/export', authenticate, exportPaymentHistory);

// Process refund
router.post(
  '/refund',
  authenticate,
  isCustomer,
  (req, res, next) => validateRefund(req.body, res, next),
  refundPayment,
);

// Check payment status
router.get(
  '/status/:reference',
  authenticate,
  (req, res, next) =>
    validateStatusCheck(
      {
        ...req.params,
        ...req.query,
      },
      res,
      next,
    ),
  getPaymentStatus,
);

// Account information
router.get('/account', authenticate, getAccountDetails);

export default router;
