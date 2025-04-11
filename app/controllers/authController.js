import prisma from "../configs/database.js"
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendForgotPaswordLink, sendVerificationCode } from "../utils/emails.js";
import { sendsmsOTP } from "../services/smsService.js";


// Helper function to generate JWT token
const generateToken = (id, userType) => {
  return jwt.sign({ id, userType }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Helper function to generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


// Register Customer
export const registerCustomer = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if customer exists
    const customerExists = await prisma.customer.findUnique({
      where: { email },
    });

    if (customerExists) {
      return res.status(400).json({ message: 'Customer already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationCode = generateOTP()

    // sendVerificationCode(email, verificationCode)
    await sendsmsOTP(phone, verificationCode)

    // Create customer
    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        otps:{
          create: {
            code:verificationCode,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000),
            isVerified:false
          }
        }
      },
    });

    // await sendVerificationCode(email, verificationCode)

    if (customer) {
      res.status(201).json({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        token: generateToken(customer.id, 'CUSTOMER'),
        otp: customer.otps
      });
    }
  } catch (error) {
    res.status(400).json({ message: 'Failed to register customer', error: error.message });
  }
};

// Register Driver
export const registerDriver = async (req, res) => {
  try {
    const { name, email, password, phone, licenseNumber } = req.body;

    // Check if driver exists
    const driverExists = await prisma.driver.findUnique({
      where: { email },
    });

    if (driverExists) {
      return res.status(400).json({ message: 'Driver already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationCode = generateOTP()

    // sendVerificationCode(email, verificationCode)
    await  sendsmsOTP(phone, verificationCode)

    // Create driver
    const driver = await prisma.driver.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        licenseNumber,
        otps:{
          create: {
            code:verificationCode,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000),
            isVerified:false
          }
        }
      },
    });

    // await sendVerificationCode(email, verificationCode)

    if (driver) {
      res.status(201).json({
        id: driver.id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        licenseNumber: driver.licenseNumber,
        token: generateToken(driver.id, 'DRIVER'),
      });
    }
  } catch (error) {
    res.status(400).json({ message: 'Failed to register driver', error: error.message });
  }
};

// Login Customer
export const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, customer.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      token: generateToken(customer.id, 'CUSTOMER'),
    });
  } catch (error) {
    res.status(400).json({ message: 'Failed to login', error: error.message });
  }
};

// Login Driver
export const loginDriver = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if driver exists
    const driver = await prisma.driver.findUnique({
      where: { email },
    });

    if (!driver) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, driver.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json({
      id: driver.id,
      name: driver.name,
      email: driver.email,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      token: generateToken(driver.id, 'DRIVER'),
    });
  } catch (error) {
    res.status(400).json({ message: 'Failed to login', error: error.message });
  }
};

// Send OTP for user verification
export const sendOTP = async (req, res) => {
  try {
    const { userId, userType, email } = req.body;

    // Validate that userId and userType are present
    if (!userId || !userType) {
      return res.status(400).json({ message: 'userId and userType are required.' });
    }

    // Find user based on userType
    const user = await prisma[userType.toLowerCase()].findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP in database
    await prisma.oTP.create({
      data: {
        code: otp,
        expiresAt,
        userType,
        userId: user.id,
      },
    });

    // Send OTP via email
    const emailSent = await sendEmail(
      email,
      'Your Verification Code',
      `Your verification code is: ${otp}\nThis code will expire in 10 minutes.`,
    );

    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.status(200).json({ message: 'OTP sent successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending OTP', error: error.message });
  }
};

// Verify OTP
export const verifyOTPcustomer = async (req, res) => {
  try {
    const { otp, email } = req.body;

    // Find user
    const user = await prisma.customer.findUnique({
      where: {
        email,
      }
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find valid OTP
    const validOTP = await prisma.oTP.findFirst({
      where: {
        customerId: user.id,  // Assuming customerId is the foreign key in the OTP table
        code: otp,
      }
    });

    if (!validOTP) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark OTP as verified
    await prisma.oTP.update({
      where: { id: validOTP.id },
      data: { isVerified: true },
    });

    // Mark user as verified
    await prisma.customer.update({
      where: { email },
      data: { isVerified: true },
    });

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(400).json({ message: 'Failed to verify OTP', error: error.message });
  }
};
export const verifyOTPDriver = async (req, res) => {
  try {
    const { otp, email } = req.body;

    // Find user
    const user = await prisma.customer.findUnique({
      where: {
        email,
      }
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find valid OTP
    const validOTP = await prisma.oTP.findFirst({
      where: {
        customerId: user.id,  // Assuming customerId is the foreign key in the OTP table
        code: otp,
      }
    });

    if (!validOTP) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark OTP as verified
    await prisma.oTP.update({
      where: { id: validOTP.id },
      data: { isVerified: true },
    });

    // Mark user as verified
    await prisma.driver.update({
      where: { id: user.id },
      data: { isVerified: true },
    });

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(400).json({ message: 'Failed to verify OTP', error: error.message });
  }
};
// Request password reset
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the user exists in either table
    let user = await prisma.customer.findUnique({ where: { email } });
    let userType = "customer";
    let userIdField = "customerId";

    if (!user) {
      user = await prisma.driver.findUnique({ where: { email } });
      userType = "driver";
      userIdField = "driverId";
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token
    await prisma.passwordReset.create({
      data: {
        token: resetToken,
        expiresAt,
        [userIdField]: user.id,
      },
    });

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&userType=${userType}`;
    await sendForgotPaswordLink(user.email,resetUrl)

  

    res.json({ message: "Password reset email sent successfully" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(400).json({
      message: "Failed to process password reset",
      error: error.message,
    });
  }
};


// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token, userType, newPassword } = req.body;

    // Find valid reset token
    const resetRequest = await prisma.passwordReset.findFirst({
      where: {
        token,
        userType,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!resetRequest) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password
    await prisma[userType.toLowerCase()].update({
      where: { id: resetRequest.userId },
      data: { password: hashedPassword },
    });

    // Mark reset token as used
    await prisma.passwordReset.update({
      where: { id: resetRequest.id },
      data: { isUsed: true },
    });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({ message: 'Failed to reset password', error: error.message });
  }
};
