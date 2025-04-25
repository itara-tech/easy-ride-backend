import { getUserProfile, updateUserProfile, deleteUserAccount } from '../services/userService.js';

export const getUserProfileController = async (req, res) => {
  try {
    const { userId } = req.params;
    const userProfile = await getUserProfile(userId);
    res.status(200).json(userProfile);
  } catch (error) {
    console.error('Error in getUserProfileController:', error);
    res.status(error.message === 'User not found' ? 404 : 500).json({
      message: error.message === 'User not found' ? 'User not found' : 'Error retrieving user profile',
      error: error.message,
    });
  }
};

export const updateUserProfileController = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    const updatedProfile = await updateUserProfile(userId, updateData);
    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error('Error in updateUserProfileController:', error);
    res.status(500).json({ message: 'Error updating user profile', error: error.message });
  }
};

export const deleteUserAccountController = async (req, res) => {
  try {
    const { userId } = req.params;
    await deleteUserAccount(userId);
    res.status(200).json({ message: 'User account successfully deleted' });
  } catch (error) {
    console.error('Error in deleteUserAccountController:', error);
    res.status(500).json({ message: 'Error deleting user account', error: error.message });
  }
};