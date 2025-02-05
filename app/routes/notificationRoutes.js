import express from "express"
import {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
} from "../controllers/notificationController.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

router.post("/", authenticateToken, createNotification)
router.get("/user/:userId", authenticateToken, getUserNotifications)
router.put("/:id/read", authenticateToken, markNotificationAsRead)

export default router

