import express from "express"
import {
    createNotification,
    getUserNotifications,
    markNotificationAsRead,
} from "../controllers/notificationController.js"
import { authenticateToken, isResourceOwner } from "../middleware/auth.js"

const router = express.Router()

// Create notification (requires authentication)
router.post("/", createNotification)

// Get user's notifications (requires authentication and resource ownership)
router.get("/user/:userId", isResourceOwner, getUserNotifications)

// Mark notification as read (requires authentication)
router.put("/:id/read", markNotificationAsRead)

export default router
