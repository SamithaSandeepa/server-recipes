const express = require("express");
const recipeController = require("../controllers/recipeController");
const { auth, optionalAuth } = require("../middleware/auth");
const {
  validateCategory,
  validateSearch,
  validateRecipeId,
  sanitizeInput,
} = require("../middleware/validation");

const router = express.Router();

// @route   GET /api/recipes/categories
// @desc    Get all available categories from TheMealDB
// @access  Public
router.get("/categories", recipeController.getCategories);

// @route   GET /api/recipes/by-category/:category
// @desc    Get recipes by category from TheMealDB
// @access  Public
router.get(
  "/by-category/:category",
  sanitizeInput,
  validateCategory,
  recipeController.getRecipesByCategory
);

// @route   GET /api/recipes/search
// @desc    Search recipes by name from TheMealDB
// @access  Public
router.get(
  "/search",
  sanitizeInput,
  validateSearch,
  recipeController.searchRecipes
);

// @route   GET /api/recipes/details/:id
// @desc    Get recipe details by ID from TheMealDB
// @access  Public
router.get(
  "/details/:id",
  sanitizeInput,
  validateRecipeId,
  recipeController.getRecipeDetails
);

// @route   GET /api/recipes/random
// @desc    Get random recipe from TheMealDB
// @access  Public
router.get("/random", recipeController.getRandomRecipe);

// @route   GET /api/recipes/featured
// @desc    Get featured recipes (5 selected categories)
// @access  Public
router.get("/featured", recipeController.getFeaturedRecipes);

// @route   GET /api/recipes/by-ingredient/:ingredient
// @desc    Get recipes by ingredient from TheMealDB
// @access  Public
router.get(
  "/by-ingredient/:ingredient",
  sanitizeInput,
  recipeController.getRecipesByIngredient
);

// @route   GET /api/recipes/by-area/:area
// @desc    Get recipes by area from TheMealDB
// @access  Public
router.get("/by-area/:area", sanitizeInput, recipeController.getRecipesByArea);

// @route   GET /api/recipes/recommendations
// @desc    Get recipe recommendations
// @access  Public (with optional auth for personalization)
router.get(
  "/recommendations",
  optionalAuth,
  recipeController.getRecommendations
);

// @route   GET /api/recipes/search/advanced
// @desc    Advanced search with multiple filters
// @access  Public
router.get("/search/advanced", sanitizeInput, recipeController.searchAdvanced);

// @route   GET /api/recipes/cache/stats
// @desc    Get cache statistics (admin only)
// @access  Public (should be admin-only in production)
router.get("/cache/stats", recipeController.getCacheStats);

// @route   DELETE /api/recipes/cache
// @desc    Clear recipe cache (admin only)
// @access  Public (should be admin-only in production)
router.delete("/cache", recipeController.clearCache);

module.exports = router;
