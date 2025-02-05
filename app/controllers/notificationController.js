import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const createNotification = async (req, res) => {
    try {
        const { userId, userType, title, message } = req.body
        const notification = await prisma.notification.create({
            data: {
                userId,
                userType,
                title,
                message,
            },
        })
        res.status(201).json(notification)
    } catch (error) {
        res.status(400).json({ message: "Failed to create notification", error: error.message })
    }
}

export const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        })
        res.json(notifications)
    } catch (error) {
        res.status(400).json({ message: "Failed to get user notifications", error: error.message })
    }
}

export const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params
        const notification = await prisma.notification.update({
            where: { id },
            data: { isRead: true },
        })
        res.json(notification)
    } catch (error) {
        res.status(400).json({ message: "Failed to mark notification as read", error: error.message })
    }
}
