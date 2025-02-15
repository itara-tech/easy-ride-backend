import { prisma } from "../Server.js"

export const getUserProfile = async (userId, userType) => {
  try {
    let user

    if (userType === "CUSTOMER") {
      user = await prisma.customer.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isVerified: true,
          createdAt: true,
        },
      })
    } else if (userType === "DRIVER") {
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
      })
    } else {
      throw new Error("Invalid user type")
    }

    if (!user) {
      throw new Error("User not found")
    }

    return user
  } catch (error) {
    console.error("Error in getUserProfile:", error)
    throw error
  }
}

export const updateUserProfile = async (userId, userType, updateData) => {
  try {
    let updatedUser

    if (userType === "CUSTOMER") {
      updatedUser = await prisma.customer.update({
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
          isVerified: true,
          createdAt: true,
        },
      })
    } else if (userType === "DRIVER") {
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
          licenseNumber: true,
          isVerified: true,
          isAvailable: true,
          currentLocation: true,
          createdAt: true,
        },
      })
    } else {
      throw new Error("Invalid user type")
    }

    return updatedUser
  } catch (error) {
    console.error("Error in updateUserProfile:", error)
    throw error
  }
}

export const deleteUserAccount = async (userId, userType) => {
    try {
      let user
      if (userType === "CUSTOMER") {
        user = await prisma.customer.findUnique({
          where: { id: userId },
        })
      } else if (userType === "DRIVER") {
        user = await prisma.driver.findUnique({
          where: { id: userId },
        })
      } else {
        throw new Error("Invalid user type")
      }
  
      if (!user) {
        return { message: "User not found or already deleted" }
      }
  
      if (userType === "CUSTOMER") {
        await prisma.customer.delete({
          where: { id: userId },
        })
      } else if (userType === "DRIVER") {
        await prisma.driver.delete({
          where: { id: userId },
        })
      }
  
      return { message: "User account successfully deleted" }
    } catch (error) {
      console.error("Error in deleteUserAccount:", error)
      throw error
    }
  }

