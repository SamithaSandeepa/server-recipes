const express = require("express");
const userController = require("../controllers/userController");
const { auth } = require("../middleware/auth");
const {
  validateFavoriteRecipe,
  sanitizeInput,
} = require("../middleware/validation");

const router = express.Router();

// @route   GET /api/users/favorites/by-category
// @desc    Get favorites grouped by category
// @access  Private
router.get(
  "/favorites/by-category",
  auth,
  userController.getFavoritesByCategory
);

// @route   GET /api/users/favorites/check/:recipeId
// @desc    Check if recipe is in favorites
// @access  Private
router.get(
  "/favorites/check/:recipeId",
  auth,
  userController.checkFavoriteStatus
);

// @route   GET /api/users/favorites
// @desc    Get user's favorite recipes
// @access  Private
router.get("/favorites", auth, userController.getFavorites);

// @route   POST /api/users/favorites
// @desc    Add recipe to favorites
// @access  Private
router.post(
  "/favorites",
  auth,
  sanitizeInput,
  validateFavoriteRecipe,
  userController.addToFavorites
);

// @route   DELETE /api/users/favorites/:recipeId
// @desc    Remove recipe from favorites
// @access  Private
router.delete("/favorites/:recipeId", auth, userController.removeFromFavorites);

// @route   DELETE /api/users/favorites
// @desc    Clear all favorite recipes
// @access  Private
router.delete("/favorites", auth, userController.clearAllFavorites);

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get("/stats", auth, userController.getUserStats);

module.exports = router;
