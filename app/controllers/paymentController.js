import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const createPayment = async (req, res) => {
  try {
    const { rideId, amount } = req.body
    const payment = await prisma.payment.create({
      data: {
        rideId,
        amount,
        status: "pending",
      },
    })
    res.status(201).json(payment)
  } catch (error) {
    res.status(400).json({ message: "Failed to create payment", error: error.message })
  }
}

export const getPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params
    const payment = await prisma.payment.findUnique({
      where: { id: Number.parseInt(id) },
    })
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" })
    }
    res.json(payment)
  } catch (error) {
    res.status(400).json({ message: "Failed to get payment status", error: error.message })
  }
}

export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const payment = await prisma.payment.update({
      where: { id: Number.parseInt(id) },
      data: { status },
    })
    res.json(payment)
  } catch (error) {
    res.status(400).json({ message: "Failed to update payment status", error: error.message })
  }
}

