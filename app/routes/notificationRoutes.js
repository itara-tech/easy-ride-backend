import express from 'express';
import {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
} from '../controllers/notificationController.js';
import { authenticateToken, isResourceOwner } from '../middleware/auth.js';

const router = express.Router();

// Create notification
router.post('/', authenticateToken, createNotification);

// Get user's notifications
router.get('/:userId', authenticateToken, isResourceOwner, getUserNotifications);

// Mark notification as read
router.put('/:id/read', authenticateToken, markNotificationAsRead);

export default router;
