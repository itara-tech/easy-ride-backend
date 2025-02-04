import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const createRideRequest = async (riderId, pickupLocation, dropoffLocation) => {
  return prisma.ride.create({
    data: {
      riderId,
      pickupLocation,
      dropoffLocation,
      status: "requested",
    },
  })
}

export const acceptRide = async (rideId, driverId) => {
  return prisma.ride.update({
    where: { id: rideId },
    data: {
      driverId,
      status: "accepted",
    },
  })
}

export const completeRide = async (rideId) => {
  return prisma.ride.update({
    where: { id: rideId },
    data: {
      status: "completed",
    },
  })
}

export const cancelRide = async (rideId) => {
  return prisma.ride.update({
    where: { id: rideId },
    data: {
      status: "canceled",
    },
  })
}

export const getNearbyRides = async (lat, lon, radius) => {
    
  const rides = await prisma.ride.findMany({
    where: {
      status: "requested",
    },
    include: {
      rider: true,
    },
  })


  return rides.filter((ride) => {
    const distance = calculateDistance(lat, lon, ride.rider.currentLat, ride.rider.currentLon)
    return distance <= radius
  })
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  const distance = R * c
  return distance
}

