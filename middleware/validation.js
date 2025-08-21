const { body, param, query, validationResult } = require("express-validator");

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Sanitize all string inputs
  const sanitizeObject = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === "string") {
        obj[key] = obj[key].trim();
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);

  next();
};

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// User registration validation
const validateUserRegistration = [
  body("name")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),

  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),

  handleValidationErrors,
];

// User login validation
const validateUserLogin = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Password is required"),

  handleValidationErrors,
];

// Category validation
const validateCategory = [
  param("category")
    .isLength({ min: 1, max: 50 })
    .withMessage("Category must be between 1 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Category can only contain letters and spaces"),

  handleValidationErrors,
];

// Search validation
const validateSearch = [
  query("search")
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage("Search term must be between 1 and 100 characters")
    .matches(/^[a-zA-Z0-9\s]+$/)
    .withMessage("Search term can only contain letters, numbers, and spaces"),

  handleValidationErrors,
];

// Pagination validation
const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  handleValidationErrors,
];

// Favorite recipe validation
const validateFavoriteRecipe = [
  body("recipeId")
    .notEmpty()
    .withMessage("Recipe ID is required")
    .isString()
    .withMessage("Recipe ID must be a string"),

  body("recipeName")
    .isLength({ min: 1, max: 100 })
    .withMessage("Recipe name must be between 1 and 100 characters"),

  body("recipeImage").isURL().withMessage("Recipe image must be a valid URL"),

  body("category")
    .isLength({ min: 1, max: 50 })
    .withMessage("Category must be between 1 and 50 characters"),

  handleValidationErrors,
];

// Recipe ID validation
const validateRecipeId = [
  param("id").matches(/^\d+$/).withMessage("Recipe ID must be numeric"),

  handleValidationErrors,
];

module.exports = {
  sanitizeInput,
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateCategory,
  validateSearch,
  validatePagination,
  validateFavoriteRecipe,
  validateRecipeId,
};
