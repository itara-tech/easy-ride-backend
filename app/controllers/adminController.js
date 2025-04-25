import * as adminService from '../services/adminService.js';

export const getAllUsers = async (req, res) => {
  try {
    const [customers, drivers] = await Promise.all([
      prisma.customer.findMany(),
      prisma.driver.findMany()
    ]);
    res.json([...customers, ...drivers]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await adminService.getUserById(userId);
    res.json(user);
  } catch (error) {
    res.status(404).json({ 
      error: error.message,
      details: 'User not found' 
    });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isVerified } = req.body;
    
    if (typeof isVerified !== 'boolean') {
      return res.status(400).json({ error: 'Invalid verification status' });
    }

    const updatedUser = await adminService.updateUserStatus(userId, isVerified);
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ 
      error: error.message,
      details: 'Failed to update user status' 
    });
  }
};

export const promoteToAdmin = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const result = await adminService.promoteToAdmin(email);
    res.json(result);
  } catch (error) {
    res.status(400).json({ 
      error: error.message,
      details: 'Failed to promote user to admin' 
    });
  }
};

export const getSystemStats = async (req, res) => {
  try {
    const stats = await adminService.getSystemStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      details: 'Failed to fetch system stats' 
    });
  }
};