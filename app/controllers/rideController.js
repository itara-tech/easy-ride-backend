import { PrismaClient } from "@prisma/client"
import * as rideService from "../services/rideService.js"

const prisma = new PrismaClient()

export const createRide = async (req, res) => {
  try {
    const { pickupLocation, dropoffLocation } = req.body;
    const riderId = req.user.id;
    const ride = await rideService.createRideRequest(riderId, pickupLocation, dropoffLocation)
    res.status(201).json(ride)
  } catch (error) {
    res.status(400).json({ message: "Failed to create ride", error: error.message })
  }
}

export const getRide = async (req, res) => {
  try {
    const { id } = req.params
    const ride = await prisma.ride.findUnique({
      where: { id: Number.parseInt(id) },
      include: { rider: true, driver: true },
    })
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" })
    }
    res.json(ride)
  } catch (error) {
    res.status(400).json({ message: "Failed to get ride", error: error.message })
  }
}

export const updateRideStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const userId = req.user.id

    let updatedRide
    switch (status) {
      case "accepted":
        updatedRide = await rideService.acceptRide(Number.parseInt(id), userId)
        break
      case "completed":
        updatedRide = await rideService.completeRide(Number.parseInt(id))
        break
      case "canceled":
        updatedRide = await rideService.cancelRide(Number.parseInt(id))
        break
      default:
        return res.status(400).json({ message: "Invalid status" })
    }

    res.json(updatedRide)
  } catch (error) {
    res.status(400).json({ message: "Failed to update ride status", error: error.message })
  }
}

export const getNearbyRides = async (req, res) => {
  try {
    const { lat, lon, radius } = req.query
    const nearbyRides = await rideService.getNearbyRides(
      Number.parseFloat(lat),
      Number.parseFloat(lon),
      Number.parseFloat(radius),
    )
    res.json(nearbyRides)
  } catch (error) {
    res.status(400).json({ message: "Failed to get nearby rides", error: error.message })
  }
}

export const getRiderActiveRides = async (req, res) => {
  try {
    const riderId = req.user.id
    const activeRides = await prisma.ride.findMany({
      where: {
        riderId,
        status: { in: ["requested", "accepted"] },
      },
      include: { driver: true },
    })
    res.json(activeRides)
  } catch (error) {
    res.status(400).json({ message: "Failed to get active rides", error: error.message })
  }
}

export const getDriverActiveRides = async (req, res) => {
  try {
    const driverId = req.user.id
    const activeRides = await prisma.ride.findMany({
      where: {
        driverId,
        status: "accepted",
      },
      include: { rider: true },
    })
    res.json(activeRides)
  } catch (error) {
    res.status(400).json({ message: "Failed to get active rides", error: error.message })
  }
}

