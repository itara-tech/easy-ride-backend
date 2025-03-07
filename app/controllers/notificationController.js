import * as notificationService from '../services/notificationService.js';

export const createNotification = async (req, res) => {
  const { userId, title, message } = req.body;
  try {
    const notification = await notificationService.createNotification(userId, title, message);
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserNotifications = async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    const notifications = await notificationService.getUserNotifications(userId, Number(page), Number(limit));
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markNotificationAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedNotification = await notificationService.markNotificationAsRead(id);
    res.json(updatedNotification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
