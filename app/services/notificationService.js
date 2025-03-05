import prisma from '../configs/database.js';

export const createNotification = async (userId, title, message) => {
  const notification = await prisma.notification.create({
    data: {
      userId,
      title,
      message,
    },
  });
  return notification;
};

export const getUserNotifications = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
  });
  return notifications;
};

export const markNotificationAsRead = async (notificationId) => {
  const updatedNotification = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
  return updatedNotification;
};
