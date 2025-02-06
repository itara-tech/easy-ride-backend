import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const createVehicle = async (req, res) => {
    try {
        const { driverId, type, regNo, model, color } = req.body

        // Check if driver exists
        const driver = await prisma.driver.findUnique({
            where: { id: driverId }
        })

        if (!driver) {
            return res.status(404).json({
                message: "Driver not found",
                error: `No driver exists with ID: ${driverId}`
            })
        }

        // Check if registration number is unique
        const existingVehicle = await prisma.vehicle.findUnique({
            where: { regNo }
        })

        if (existingVehicle) {
            return res.status(400).json({
                message: "Vehicle already exists",
                error: `A vehicle with registration number ${regNo} already exists`
            })
        }

        const vehicle = await prisma.vehicle.create({
            data: {
                driverId,
                type,
                regNo,
                model,
                color
            },
            include: {
                driver: true
            }
        })

        res.status(201).json(vehicle)
    } catch (error) {
        console.error("Vehicle creation error:", error)
        res.status(400).json({ message: "Failed to create vehicle", error: error.message })
    }
}

export const getDriverVehicles = async (req, res) => {
    try {
        const { driverId } = req.params

        const vehicles = await prisma.vehicle.findMany({
            where: { driverId },
            include: {
                driver: true
            }
        })

        res.json(vehicles)
    } catch (error) {
        console.error("Get vehicles error:", error)
        res.status(400).json({ message: "Failed to get vehicles", error: error.message })
    }
}

export const updateVehicle = async (req, res) => {
    try {
        const { id } = req.params
        const { type, model, color, isActive } = req.body

        const vehicle = await prisma.vehicle.update({
            where: { id },
            data: {
                type,
                model,
                color,
                isActive
            },
            include: {
                driver: true
            }
        })

        res.json(vehicle)
    } catch (error) {
        console.error("Update vehicle error:", error)
        res.status(400).json({ message: "Failed to update vehicle", error: error.message })
    }
}

export const deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params

        await prisma.vehicle.delete({
            where: { id }
        })

        res.json({ message: "Vehicle deleted successfully" })
    } catch (error) {
        console.error("Delete vehicle error:", error)
        res.status(400).json({ message: "Failed to delete vehicle", error: error.message })
    }
}