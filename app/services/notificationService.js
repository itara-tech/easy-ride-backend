import prisma from '../configs/database.js';

export const createNotification = async (userId, title, message) => {
  const user =
    (await prisma.customer.findUnique({
      where: { id: userId },
    })) ||
    (await prisma.driver.findUnique({
      where: { id: userId },
    }));

  if (!user) {
    console.error(`User with ID ${userId} not found in database.`);
    throw new Error('User not found');
  }
  console.log(user);
  // Check if the user is a Customer or a Driver
  const customer = await prisma.customer.findUnique({ where: { id: userId } });
  const driver = await prisma.driver.findUnique({ where: { id: userId } });

  if (!customer && !driver) {
    throw new Error('User not found');
  }

  const data = {
    title,
    message,
    isRead: false,
    createdAt: new Date(),
    customerId: customer ? userId : null,
    driverId: driver ? userId : null,
  };

  return await prisma.notification.create({ data });
};

export const getUserNotifications = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  return await prisma.notification.findMany({
    where: {
      OR: [{ customerId: userId }, { driverId: userId }],
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
  });
};

export const markNotificationAsRead = async (notificationId) => {
  return await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
};
