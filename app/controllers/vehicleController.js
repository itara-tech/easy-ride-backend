import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const addVehicle = async (req, res) => {
  try {
    const { userId, make, model, year, licensePlate, color } = req.body
    const vehicle = await prisma.vehicle.create({
      data: {
        userId,
        make,
        model,
        year,
        licensePlate,
        color,
      },
    })
    res.status(201).json(vehicle)
  } catch (error) {
    res.status(400).json({ message: "Failed to add vehicle", error: error.message })
  }
}

export const getVehicles = async (req, res) => {
  try {
    const { userId } = req.params
    const vehicles = await prisma.vehicle.findMany({
      where: { userId: Number.parseInt(userId) },
    })
    res.json(vehicles)
  } catch (error) {
    res.status(400).json({ message: "Failed to get vehicles", error: error.message })
  }
}

export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params
    const { make, model, year, licensePlate, color } = req.body
    const vehicle = await prisma.vehicle.update({
      where: { id: Number.parseInt(id) },
      data: {
        make,
        model,
        year,
        licensePlate,
        color,
      },
    })
    res.json(vehicle)
  } catch (error) {
    res.status(400).json({ message: "Failed to update vehicle", error: error.message })
  }
}

export const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params
    await prisma.vehicle.delete({
      where: { id: Number.parseInt(id) },
    })
    res.json({ message: "Vehicle deleted successfully" })
  } catch (error) {
    res.status(400).json({ message: "Failed to delete vehicle", error: error.message })
  }
}

export default {
  addVehicle,
  getVehicles,
  updateVehicle,
  deleteVehicle,
}