import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
        isActive: true,
      },
    })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json(user)
  } catch (error) {
    res.status(400).json({ message: "Failed to get user profile", error: error.message })
  }
}

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id
    const { name, phoneNumber } = req.body
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, phoneNumber },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
        isActive: true,
      },
    })
    res.json(updatedUser)
  } catch (error) {
    res.status(400).json({ message: "Failed to update user profile", error: error.message })
  }
}

export const updateUserLocation = async (req, res) => {
  try {
    const userId = req.user.id
    const { lat, lon } = req.body
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        currentLat: Number.parseFloat(lat),
        currentLon: Number.parseFloat(lon),
        lastLocationUpdate: new Date(),
      },
    })
    res.json({ message: "Location updated successfully" })
  } catch (error) {
    res.status(400).json({ message: "Failed to update user location", error: error.message })
  }
}

export const getUserRideHistory = async (req, res) => {
  try {
    const userId = req.user.id
    const rides = await prisma.ride.findMany({
      where: {
        OR: [{ riderId: userId }, { driverId: userId }],
        status: { in: ["completed", "canceled"] },
      },
      include: {
        rider: {
          select: { id: true, name: true },
        },
        driver: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    res.json(rides)
  } catch (error) {
    res.status(400).json({ message: "Failed to get ride history", error: error.message })
  }
}

export const toggleUserActiveStatus = async (req, res) => {
  try {
    const userId = req.user.id
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    })
    res.json({ message: "User active status toggled successfully", isActive: updatedUser.isActive })
  } catch (error) {
    res.status(400).json({ message: "Failed to toggle user active status", error: error.message })
  }
}

export const getNearbyDrivers = async (req, res) => {
  try {
    const { lat, lon } = req.query
    const drivers = await prisma.user.findMany({
      where: {
        role: "driver",
        currentLat: {
          gte: Number.parseFloat(lat) - 0.1,
          lte: Number.parseFloat(lat) + 0.1,
        },
        currentLon: {
          gte: Number.parseFloat(lon) - 0.1,
          lte: Number.parseFloat(lon) + 0.1,
        },
      },
      select: { id: true, name: true },
    })
    res.json(drivers)
  } catch (error) {
    res.status(400).json({ message: "Failed to get nearby drivers", error: error.message })
  }
}

