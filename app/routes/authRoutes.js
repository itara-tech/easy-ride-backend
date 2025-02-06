import express from "express"
import {
    registerCustomer,
    registerDriver,
    loginCustomer,
    loginDriver,
} from "../controllers/authController.js"

const router = express.Router()

// Customer routes
router.post("/customer/register", registerCustomer)
router.post("/customer/login", loginCustomer)

// Driver routes
router.post("/driver/register", registerDriver)
router.post("/driver/login", loginDriver)

export default router