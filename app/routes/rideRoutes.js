import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  createRide,
  getRide,
  updateRideStatus,
  getNearbyRides,
  getRiderActiveRides,
  getDriverActiveRides
} from '../controllers/rideController.js';

const router = express.Router();

/**
 * @swagger
 * /api/rides:
 *   post:
 *     summary: Create a new ride request
 *     tags: [Rides]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pickupLocation
 *               - dropoffLocation
 *             properties:
 *               pickupLocation:
 *                 type: string
 *               dropoffLocation:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ride created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateToken, createRide);

/**
 * @swagger
 * /api/rides/{id}:
 *   get:
 *     summary: Get a specific ride
 *     tags: [Rides]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ride details
 *       404:
 *         description: Ride not found
 */
router.get('/:id', authenticateToken, getRide);

/**
 * @swagger
 * /api/rides/{id}/status:
 *   put:
 *     summary: Update ride status
 *     tags: [Rides]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, completed, canceled]
 *     responses:
 *       200:
 *         description: Ride status updated successfully
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Ride not found
 */
router.put('/:id/status', authenticateToken, updateRideStatus);

/**
 * @swagger
 * /api/rides/nearby:
 *   get:
 *     summary: Get nearby ride requests
 *     tags: [Rides]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: lon
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: radius
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of nearby rides
 */
router.get('/nearby', authenticateToken, getNearbyRides);

/**
 * @swagger
 * /api/rides/rider/active:
 *   get:
 *     summary: Get active rides for the rider
 *     tags: [Rides]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active rides for the rider
 */
router.get('/rider/active', authenticateToken, getRiderActiveRides);

/**
 * @swagger
 * /api/rides/driver/active:
 *   get:
 *     summary: Get active rides for the driver
 *     tags: [Rides]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active rides for the driver
 */
router.get('/driver/active', authenticateToken, getDriverActiveRides);

export default router;
