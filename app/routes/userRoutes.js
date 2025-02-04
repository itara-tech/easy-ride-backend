import express from "express"
import { authenticateToken } from "../middleware/auth.js"
import {
  getUserProfile,
  updateUserProfile,
  updateUserLocation,
  getUserRideHistory,
  toggleUserActiveStatus,
} from "../controllers/userController.js"

const router = express.Router()

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", authenticateToken, getUserProfile)

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put("/profile", authenticateToken, updateUserProfile)

/**
 * @swagger
 * /api/users/location:
 *   put:
 *     summary: Update user location
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lat
 *               - lon
 *             properties:
 *               lat:
 *                 type: number
 *               lon:
 *                 type: number
 *     responses:
 *       200:
 *         description: Location updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put("/location", authenticateToken, updateUserLocation)

/**
 * @swagger
 * /api/users/ride-history:
 *   get:
 *     summary: Get user ride history
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User ride history
 *       401:
 *         description: Unauthorized
 */
router.get("/ride-history", authenticateToken, getUserRideHistory)

/**
 * @swagger
 * /api/users/toggle-active:
 *   put:
 *     summary: Toggle user active status
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User active status toggled successfully
 *       401:
 *         description: Unauthorized
 */
router.put("/toggle-active", authenticateToken, toggleUserActiveStatus)

export default router

