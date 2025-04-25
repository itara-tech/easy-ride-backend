import prisma from '../configs/database.js';
import { ADMIN_ALLOWED_EMAILS } from '../config/adminConfig.js';

export const getAllUsers = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  
  const [customers, drivers, totalCustomers, totalDrivers] = await Promise.all([
    prisma.customer.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isVerified: true,
        isAdmin: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.driver.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        licenseNumber: true,
        isVerified: true,
        isAvailable: true,
        isAdmin: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.customer.count(),
    prisma.driver.count()
  ]);

  return {
    customers,
    drivers,
    pagination: {
      page,
      limit,
      total: totalCustomers + totalDrivers,
      totalPages: Math.ceil((totalCustomers + totalDrivers) / limit)
    }
  };
};

export const getUserById = async (userId) => {
  const [customer, driver] = await Promise.all([
    prisma.customer.findUnique({ 
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        isVerified: true,
        isAdmin: true,
        createdAt: true
      }
    }),
    prisma.driver.findUnique({ 
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        licenseNumber: true,
        isVerified: true,
        isAvailable: true,
        isAdmin: true,
        currentLocation: true,
        createdAt: true
      }
    })
  ]);

  if (!customer && !driver) {
    throw new Error('User not found');
  }

  return customer || driver;
};

export const updateUserStatus = async (userId, isVerified) => {
  let updatedUser = await prisma.customer.update({
    where: { id: userId },
    data: { isVerified }
  }).catch(() => null);

  if (!updatedUser) {
    updatedUser = await prisma.driver.update({
      where: { id: userId },
      data: { isVerified }
    }).catch(() => null);
  }

  if (!updatedUser) {
    throw new Error('User not found');
  }

  return updatedUser;
};

export const promoteToAdmin = async (email) => {
  if (!ADMIN_ALLOWED_EMAILS.includes(email)) {
    throw new Error('Email not authorized for admin access');
  }

  const [customerUpdate, driverUpdate] = await Promise.all([
    prisma.customer.updateMany({
      where: { email, isAdmin: false },
      data: { isAdmin: true }
    }),
    prisma.driver.updateMany({
      where: { email, isAdmin: false },
      data: { isAdmin: true }
    })
  ]);

  if (customerUpdate.count === 0 && driverUpdate.count === 0) {
    throw new Error('User not found or already an admin');
  }

  return { 
    message: 'User promoted to admin successfully',
    promotedAs: customerUpdate.count > 0 ? 'CUSTOMER' : 'DRIVER'
  };
};

export const getSystemStats = async () => {
  const [
    customerCount,
    driverCount,
    tripCount,
    activeRideRequests,
    completedTrips,
    canceledTrips
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.driver.count(),
    prisma.trip.count(),
    prisma.rideRequest.count({ where: { status: 'REQUESTED' } }),
    prisma.trip.count({ where: { status: 'COMPLETED' } }),
    prisma.trip.count({ where: { status: 'CANCELED' } })
  ]);

  return {
    users: {
      total: customerCount + driverCount,
      customers: customerCount,
      drivers: driverCount,
      admins: await prisma.customer.count({ where: { isAdmin: true } }) + 
             await prisma.driver.count({ where: { isAdmin: true } })
    },
    trips: {
      total: tripCount,
      completed: completedTrips,
      canceled: canceledTrips,
      activeRequests: activeRideRequests
    }
  };
};