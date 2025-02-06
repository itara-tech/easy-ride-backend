import passport from "passport"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Middleware to authenticate JWT token
export const authenticateToken = passport.authenticate("jwt", { session: false })

// Middleware to check if user is a customer
export const isCustomer = async (req, res, next) => {
    try {
        if (req.user.userType !== "CUSTOMER") {
            return res.status(403).json({ message: "Access denied. Customer only." })
        }
        next()
    } catch (error) {
        res.status(401).json({ message: "Authentication failed", error: error.message })
    }
}

// Middleware to check if user is a driver
export const isDriver = async (req, res, next) => {
    try {
        if (req.user.userType !== "DRIVER") {
            return res.status(403).json({ message: "Access denied. Driver only." })
        }
        next()
    } catch (error) {
        res.status(401).json({ message: "Authentication failed", error: error.message })
    }
}

// Middleware to check if user owns the resource
export const isResourceOwner = async (req, res, next) => {
    try {
        const { userId } = req.params
        if (req.user.id !== userId) {
            return res.status(403).json({ message: "Access denied. Not the resource owner." })
        }
        next()
    } catch (error) {
        res.status(401).json({ message: "Authentication failed", error: error.message })
    }
}