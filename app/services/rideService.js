import { PrismaClient } from "@prisma/client";
import { prisma } from "../Server.js";



export const createRideRequest = async (customerId, source, destination) => {
  if (!prisma) {
    throw new Error('Prisma client not initialized');
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }
    if (!source || !source.lat || !source.lon || !destination || !destination.lat || !destination.lon) {
      throw new Error("Invalid source or destination coordinates");
    }

    const distance = calculateDistance(source.lat, source.lon, destination.lat, destination.lon);

    // Validate distance calculation
    if (isNaN(distance) || distance < 0) {
      console.warn(`Invalid distance calculation: 
        Source: (${source.lat}, ${source.lon}), 
        Destination: (${destination.lat}, ${destination.lon})`);
      throw new Error("Unable to calculate ride distance");
    }

    // pricing calculation 
    const baseRate = 5.0; // starting fare
    const ratePerKm = 700 ; // per kilometer
    const estimatedPrice = Math.max(baseRate, baseRate + distance * ratePerKm);

    return await prisma.rideRequest.create({
      data: {
        customerId,
        source: JSON.stringify({
          latitude: source.lat,
          longitude: source.lon,
        }),
        destination: JSON.stringify({
          latitude: destination.lat,
          longitude: destination.lon,
        }),
        estimatedPrice,
        status: "REQUESTED",
      },
    });
  } catch (error) {
    console.error("Error creating ride request:", error.message);
    throw new Error("Failed to create ride request");
  }
}

export const acceptRide = async (rideRequestId, driverId) => {
  const existingAcceptance = await prisma.rideAccept.findUnique({
    where: { requestId: rideRequestId },
  });

  if (existingAcceptance) {
    throw new Error('Ride request has already been accepted.');
  }
  if (!prisma) {
    throw new Error('Prisma client not initialized');
  }

  try {
    const rideAccept = await prisma.rideAccept.create({
      data: {
        requestId: rideRequestId,
        driverId,
        acceptedAt: new Date(),
      }
    });

    
    const rideRequest = await prisma.rideRequest.findUnique({
      where: { id: rideRequestId },
    });

    const trip = await prisma.trip.create({
      data: {
        customerId: rideRequest.customerId,
        driverId,
        requestId: rideRequestId,
        status: "ACCEPTED",
        source: rideRequest.source,
        destination: rideRequest.destination,
        paymentStatus: "PENDING",
      },
    });

    return { rideAccept, trip };
  } catch (error) {
    console.error('Error accepting ride:', error);
    throw error;
  }
}

export const completeRide = async (tripId, finalAmount) => {
  if (!prisma) {
    throw new Error('Prisma client not initialized');
  }

  try {
    const rideComplete = await prisma.rideComplete.create({
      data: {
        tripId,
        finalAmount,
        completedAt: new Date(),
      },
    });

    // Update the trip status to completed
    const trip = await prisma.trip.update({
      where: { id: tripId },
      data: { status: "COMPLETED" },
    });

    return { rideComplete, trip };
  } catch (error) {
    console.error('Error completing ride:', error);
    throw error;
  }
}

export const cancelRide = async (tripId, canceledByType, canceledById, reason) => {
  if (!prisma) {
    throw new Error('Prisma client not initialized');
  }

  try {
    //Ensure the trip exists
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      throw new Error('Trip not found');
    }

    
    return await prisma.rideCancel.create({
      data: {
        tripId,
        canceledByType,
        canceledById,
        reason,
        canceledAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error canceling ride:', error.message);
    throw error;
  }
};


export const getNearbyRides = async (lat, lon, radius) => {
  if (!prisma) {
    throw new Error('Prisma client not initialized');
  }

  try {
    const rides = await prisma.rideRequest.findMany({
      where: {
        status: "REQUESTED",
      },
      include: {
        customer: true,
      },
    });

    return rides.filter((ride) => {
      
      if (!ride.customer || !ride.customer.currentLocation || !ride.customer.currentLocation.lat || !ride.customer.currentLocation.lon) {
        return false;
      }

      const distance = calculateDistance(
        lat, 
        lon, 
        ride.customer.currentLocation.lat, 
        ride.customer.currentLocation.lon
      );
      return distance <= radius;
    });
  } catch (error) {
    console.error('Error getting nearby rides:', error);
    throw error;
  }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  return distance;
}
