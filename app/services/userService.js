import { prisma } from '../Server.js';

export const getUserProfile = async (userId) => {
  try {
    // Try to find the user as a Customer first
    let user = await prisma.customer.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isVerified: true,
        createdAt: true,
      },
    });

    // If not found as Customer, try as Driver
    if (!user) {
      user = await prisma.driver.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          licenseNumber: true,
          isVerified: true,
          isAvailable: true,
          currentLocation: true,
          createdAt: true,
        },
      });
    }

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, updateData) => {
  try {
    // Try to update as Customer first
    let updatedUser = await prisma.customer.update({
      where: { id: userId },
      data: {
        name: updateData.name,
        phone: updateData.phone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
      },
    }).catch(() => null); // If not found, return null

    // If not found as Customer, try as Driver
    if (!updatedUser) {
      updatedUser = await prisma.driver.update({
        where: { id: userId },
        data: {
          name: updateData.name,
          phone: updateData.phone,
          licenseNumber: updateData.licenseNumber,
          isAvailable: updateData.isAvailable,
          currentLocation: updateData.currentLocation,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          licenseNumber: true,
          isVerified: true,
          isAvailable: true,
          currentLocation: true,
          createdAt: true,
        },
      });
    }

    return updatedUser;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    throw error;
  }
};

export const deleteUserAccount = async (userId) => {
  try {
    // Try to delete as Customer first
    const deletedCustomer = await prisma.customer.delete({
      where: { id: userId },
    }).catch(() => null); // If not found, return null

    // If not found as Customer, try as Driver
    if (!deletedCustomer) {
      await prisma.driver.delete({
        where: { id: userId },
      });
    }

    return { message: 'User account successfully deleted' };
  } catch (error) {
    console.error('Error in deleteUserAccount:', error);
    throw error;
  }
};