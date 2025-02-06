import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

// Helper function to generate JWT token
const generateToken = (id, userType) => {
    return jwt.sign({ id, userType }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    })
}

// Register Customer
export const registerCustomer = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body

        // Check if customer exists
        const customerExists = await prisma.customer.findUnique({
            where: { email },
        })

        if (customerExists) {
            return res.status(400).json({ message: "Customer already exists" })
        }

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Create customer
        const customer = await prisma.customer.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone,
            },
        })

        if (customer) {
            res.status(201).json({
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                token: generateToken(customer.id, "CUSTOMER"),
            })
        }
    } catch (error) {
        res.status(400).json({ message: "Failed to register customer", error: error.message })
    }
}

// Register Driver
export const registerDriver = async (req, res) => {
    try {
        const { name, email, password, phone, licenseNumber } = req.body

        // Check if driver exists
        const driverExists = await prisma.driver.findUnique({
            where: { email },
        })

        if (driverExists) {
            return res.status(400).json({ message: "Driver already exists" })
        }

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Create driver
        const driver = await prisma.driver.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone,
                licenseNumber,
            },
        })

        if (driver) {
            res.status(201).json({
                id: driver.id,
                name: driver.name,
                email: driver.email,
                phone: driver.phone,
                licenseNumber: driver.licenseNumber,
                token: generateToken(driver.id, "DRIVER"),
            })
        }
    } catch (error) {
        res.status(400).json({ message: "Failed to register driver", error: error.message })
    }
}

// Login Customer
export const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body

        // Check if customer exists
        const customer = await prisma.customer.findUnique({
            where: { email },
        })

        if (!customer) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        // Check password
        const isMatch = await bcrypt.compare(password, customer.password)

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        res.json({
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            token: generateToken(customer.id, "CUSTOMER"),
        })
    } catch (error) {
        res.status(400).json({ message: "Failed to login", error: error.message })
    }
}

// Login Driver
export const loginDriver = async (req, res) => {
    try {
        const { email, password } = req.body

        // Check if driver exists
        const driver = await prisma.driver.findUnique({
            where: { email },
        })

        if (!driver) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        // Check password
        const isMatch = await bcrypt.compare(password, driver.password)

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        res.json({
            id: driver.id,
            name: driver.name,
            email: driver.email,
            phone: driver.phone,
            licenseNumber: driver.licenseNumber,
            token: generateToken(driver.id, "DRIVER"),
        })
    } catch (error) {
        res.status(400).json({ message: "Failed to login", error: error.message })
    }
}
