const express = require("express");
const authController = require("../controllers/authController");
const { auth } = require("../middleware/auth");
const {
  validateUserRegistration,
  validateUserLogin,
  sanitizeInput,
} = require("../middleware/validation");

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  "/register",
  sanitizeInput,
  validateUserRegistration,
  authController.register
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", sanitizeInput, validateUserLogin, authController.login);

// @route   GET /api/auth/me
// @desc    Get current user info
// @access  Private
router.get("/me", auth, authController.getProfile);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", auth, sanitizeInput, authController.updateProfile);

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post("/logout", auth, authController.logout);

// @route   DELETE /api/auth/account
// @desc    Delete user account
// @access  Private
router.delete("/account", auth, authController.deleteAccount);

module.exports = router;
