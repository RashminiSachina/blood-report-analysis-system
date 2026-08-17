const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const crypto = require("crypto");
const sendEmail = require("../services/emailService");


// Helper to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists" });
    }

    // Create user (password is hashed by the pre-save hook)
    const user = await User.create({ name, email, password });

    return res.status(201).json({
      message: "Account created successfully",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Register error:", error.message);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and return token
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.status(200).json({
      message: "Login successful",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

// @route   POST /api/auth/google
// @desc    Authenticate user with Google idToken
// @access  Public
router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: "No ID token provided" });

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;
    
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, googleId, authProvider: "google" });
    } else if (!user.googleId) {
      // Link existing account with Google
      user.googleId = googleId;
      await user.save();
    }
    
    return res.status(200).json({
      message: "Google login successful",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        authProvider: user.authProvider || "google",
      },
    });
  } catch (error) {
    console.error("Google auth error:", error.message);
    return res.status(401).json({ message: "Google authentication failed" });
  }
});

 

// @route   POST /api/auth/forgot-password
// @desc    Forgot password (generates OTP)
// @access  Public
router.post("/forgot-password", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: "There is no user with that email address." });
    }

    const otp = user.getResetPasswordOtp();
    await user.save({ validateBeforeSave: false });

    // Send actual email here if credentials exist, otherwise log to console for dev safety
    try {
      if ((process.env.SMTP_USER || process.env.SMTP_EMAIL) && (process.env.SMTP_PASS || process.env.SMTP_PASSWORD)) {
        await sendEmail({
          email: user.email,
          subject: 'Password Reset OTP - VitalRead',
          message: `Your password reset OTP is: ${otp}\n\nIt is valid for 10 minutes. If you did not request a password reset, please ignore this email.`,
        });
      } else {
        console.warn(`[WARNING] No SMTP credentials configured in .env. Mock email sent to ${user.email} with OTP: ${otp}`);
      }
      
      res.status(200).json({ success: true, message: "OTP sent to email" });
    } catch (err) {
      console.error("Email service error:", err);
      // Clean up the OTP if the email failed
      user.resetPasswordOtp = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: "Could not send the email." });
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Email test could not be sent" });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password
// @access  Public
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Please provide email, OTP, and a new password" });
    }

    const resetPasswordOtp = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await User.findOne({
      email,
      resetPasswordOtp,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successfully! You can now log in." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
