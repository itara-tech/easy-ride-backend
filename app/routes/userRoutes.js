import express from 'express';
import { authenticate, isResourceOwner } from '../middleware/auth.js';
import {
  getUserProfileController,
  updateUserProfileController,
  deleteUserAccountController,
} from '../controllers/userController.js';

const router = express.Router();

// Get user profile
router.get('/:userId', authenticate, isResourceOwner, getUserProfileController);

// Update user profile
router.put('/:userId', authenticate, isResourceOwner, updateUserProfileController);

// Delete user account
router.delete('/:userId', authenticate, isResourceOwner, deleteUserAccountController);

export default router;
