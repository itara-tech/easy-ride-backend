import express from 'express';
import {
  createRideRequestController,
  acceptRideController,
  completeRideController,
  cancelRideController,
  getNearbyRidesController,
  reorderRideController,
} from '../controllers/rideController.js';
import { authenticate, isCustomer, isDriver } from '../middleware/auth.js';

const router = express.Router();

// Create a new ride request (customer only)
router.post('/request', authenticate, isCustomer, createRideRequestController);

// Accept a ride (driver only)
router.put('/accept', acceptRideController);

// Complete a ride (driver only)
router.put('/complete',  completeRideController);

// Cancel a ride (customer only)
router.put('/cancel', cancelRideController);

// Get nearby ride requests (driver only)
router.get('/nearby', getNearbyRidesController);

// Reorder a ride
router.post('/reorder', reorderRideController);

export default router;
