import express from 'express';
import { getAllUsers, getUserById, updateUserStatus, getSystemStats } from '../controllers/adminController.js';
import { authenticate, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticate, isAdmin);

router.get('/users', getAllUsers);
router.get('/users/:userType/:userId', getUserById);
router.put('/users/:userType/:userId', updateUserStatus);
router.get('/stats', getSystemStats);

export default router;
