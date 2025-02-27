import express from 'express';
import {
  createRideRequestController,
  acceptRideController,
  completeRideController,
  cancelRideController,
  getNearbyRidesController,
  reorderRideController
} from '../controllers/rideController.js';
import { authenticate, isCustomer, isDriver } from '../middleware/auth.js';

const router = express.Router();

// Create a new ride request (customer only)
router.post('/request', authenticate, isCustomer, createRideRequestController);

// Accept a ride (driver only)
router.put('/accept', authenticate, isDriver, acceptRideController);

// Complete a ride (driver only)
router.put('/complete', authenticate, isDriver, completeRideController);

// Cancel a ride (customer only)
router.put('/cancel', authenticate, isCustomer, cancelRideController);

// Get nearby ride requests (driver only)
router.get('/nearby', authenticate, isDriver, getNearbyRidesController);

// Reorder a ride
router.post('/reorder', reorderRideController);

export default router;