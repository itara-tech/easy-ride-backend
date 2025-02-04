import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client"
import transporter from "../configs/smtp.js"

const prisma = new PrismaClient()

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword,
                role: "user",
            },
        })
        res.status(201).json({ message: "User registered successfully", userId: user.id })
    } catch (error) {
        res.status(400).json({ message: "Registration failed", error: error.message })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" })
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" })
        }
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" })
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        })
    } catch (error) {
        res.status(400).json({ message: "Login failed", error: error.message })
    }
}

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" })
        await prisma.passwordReset.create({
            data: {
                email,
                token,
                expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
            },
        })
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: "Password Reset",
            html: `Click <a href="${resetLink}">here</a> to reset your password.`,
        })
        res.json({ message: "Password reset email sent" })
    } catch (error) {
        res.status(400).json({ message: "Failed to send reset email", error: error.message })
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body
        const passwordReset = await prisma.passwordReset.findUnique({ where: { token } })
        if (!passwordReset || passwordReset.expiresAt < new Date()) {
            return res.status(400).json({ message: "Invalid or expired token" })
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        await prisma.user.update({
            where: { email: passwordReset.email },
            data: { passwordHash: hashedPassword },
        })
        await prisma.passwordReset.delete({ where: { token } })
        res.json({ message: "Password reset successful" })
    } catch (error) {
        res.status(400).json({ message: "Failed to reset password", error: error.message })
    }
}

export const sendOTP = async (req, res) => {
    try {
        const { email } = req.body
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

        await prisma.oTP.create({
            data: {
                email,
                code: otp,
                expiresAt,
            },
        })

        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: "Your OTP for authentication",
            text: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
        })

        res.json({ message: "OTP sent successfully" })
    } catch (error) {
        res.status(400).json({ message: "Failed to send OTP", error: error.message })
    }
}

export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body
        const otpRecord = await prisma.oTP.findFirst({
            where: {
                email,
                code: otp,
                expiresAt: { gt: new Date() },
            },
        })

        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid or expired OTP" })
        }

        await prisma.oTP.delete({ where: { id: otpRecord.id } })

        res.json({ message: "OTP verified successfully" })
    } catch (error) {
        res.status(400).json({ message: "Failed to verify OTP", error: error.message })
    }
}

