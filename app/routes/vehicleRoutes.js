import express from "express"
import { addVehicle, getVehicles, updateVehicle, deleteVehicle } from "../controllers/vehicleController.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

router.post("/", authenticateToken, addVehicle)
router.get("/user/:userId", authenticateToken, getVehicles)
router.put("/:id", authenticateToken, updateVehicle)
router.delete("/:id", authenticateToken, deleteVehicle)

export default router

