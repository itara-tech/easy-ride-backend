import { prisma } from "../Server.js"


export const createNotification = async (req, res) => {
    try {
        const { userId, userType, title, message } = req.body

        // First verify that the user exists
        let userExists = false
        if (userType === 'CUSTOMER') {
            const customer = await prisma.customer.findUnique({
                where: { id: userId }
            })
            userExists = !!customer
        } else if (userType === 'DRIVER') {
            const driver = await prisma.driver.findUnique({
                where: { id: userId }
            })
            userExists = !!driver
        }

        if (!userExists) {
            return res.status(404).json({ 
                message: `${userType.toLowerCase()} not found`,
                error: `No ${userType.toLowerCase()} exists with ID: ${userId}`
            })
        }

        // Create the notification with the correct relation based on userType
        const notification = await prisma.notification.create({
            data: {
                userType,
                title,
                message,
                ...(userType === 'CUSTOMER' ? {
                    customer: {
                        connect: { id: userId }
                    }
                } : {
                    driver: {
                        connect: { id: userId }
                    }
                })
            },
            include: {
                customer: userType === 'CUSTOMER',
                driver: userType === 'DRIVER'
            }
        })
        res.status(201).json(notification)
    } catch (error) {
        console.error("Notification creation error:", error)
        res.status(400).json({ message: "Failed to create notification", error: error.message })
    }
}

export const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params
        const notifications = await prisma.notification.findMany({
            where: {
                OR: [
                    { customer: { id: userId } },
                    { driver: { id: userId } }
                ]
            },
            orderBy: { createdAt: "desc" },
            include: {
                customer: true,
                driver: true
            }
        })
        res.json(notifications)
    } catch (error) {
        console.error("Get notifications error:", error)
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
        console.error("Mark notification error:", error)
        res.status(400).json({ message: "Failed to mark notification as read", error: error.message })
    }
}
