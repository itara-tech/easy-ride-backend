import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import { createVehicle, getDriverVehicles, updateVehicle, deleteVehicle } from '../controllers/vehicleController.js'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Create a new vehicle
router.post('/', createVehicle)

// Get all vehicles for a driver
router.get('/driver/:driverId', getDriverVehicles)

// Update a vehicle
router.put('/:id', updateVehicle)

// Delete a vehicle
router.delete('/:id', deleteVehicle)

export default router