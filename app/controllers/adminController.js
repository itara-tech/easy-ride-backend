import * as adminService from '../services/adminService.js';

export const getAllUsers = async (req, res) => {
  const { userType, page, limit } = req.query;
  try {
    const users = await adminService.getAllUsers(userType, Number.parseInt(page), Number.parseInt(limit));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req, res) => {
  const { userType, userId } = req.params;
  try {
    const user = await adminService.getUserById(userType, userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  const { userType, userId } = req.params;
  const { isVerified } = req.body;
  try {
    const updatedUser = await adminService.updateUserStatus(userType, userId, isVerified);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSystemStats = async (req, res) => {
  try {
    const stats = await adminService.getSystemStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
