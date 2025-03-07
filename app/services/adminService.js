import prisma from '../configs/database.js';

export const getAllUsers = async (userType, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const users = await prisma[userType.toLowerCase()].findMany({
    skip,
    take: limit,
  });
  return users;
};

export const getUserById = async (userType, userId) => {
  const user = await prisma[userType.toLowerCase()].findUnique({
    where: { id: userId },
  });
  return user;
};

export const updateUserStatus = async (userType, userId, isVerified) => {
  const updatedUser = await prisma[userType.toLowerCase()].update({
    where: { id: userId },
    data: { isVerified },
  });
  return updatedUser;
};

export const getSystemStats = async () => {
  const [customerCount, driverCount, tripCount, activeRideRequests] = await Promise.all([
    prisma.customer.count(),
    prisma.driver.count(),
    prisma.trip.count(),
    prisma.rideRequest.count({ where: { status: 'REQUESTED' } }),
  ]);

  return {
    customerCount,
    driverCount,
    tripCount,
    activeRideRequests,
  };
};
