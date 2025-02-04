import express from "express"
import passport from "passport"
import { login, register, resetPassword, forgotPassword, sendOTP, verifyOTP } from "../controllers/authController.js"

const router = express.Router()

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
router.post("/register", register)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized
 */
router.post("/login", login)

router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)

router.post("/send-otp", sendOTP)
router.post("/verify-otp", verifyOTP)

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }))
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/login" }), (req, res) => {
  res.redirect(process.env.FRONTEND_URL)
})

router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }))
router.get("/facebook/callback", passport.authenticate("facebook", { failureRedirect: "/login" }), (req, res) => {
  res.redirect(process.env.FRONTEND_URL)
})

router.get("/apple", passport.authenticate("apple"))
router.post("/apple/callback", passport.authenticate("apple", { failureRedirect: "/login" }), (req, res) => {
  res.redirect(process.env.FRONTEND_URL)
})

export default router

