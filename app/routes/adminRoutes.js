import express from 'express';
import { 
  getAllUsers, 
  getUserById, 
  updateUserStatus, 
  getSystemStats,
  promoteToAdmin 
} from '../controllers/adminController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate, isAdmin);

// User management
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserById);
router.put('/users/:userId/status', updateUserStatus);
router.post('/users/promote', promoteToAdmin);

// System stats
router.get('/stats', getSystemStats);

export default router;