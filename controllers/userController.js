const userService = require("../services/userService");

class UserController {
  async getFavorites(req, res) {
    try {
      const result = await userService.getFavoriteRecipes(req.user._id);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Get favorites error:", error);

      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(500).json({
        success: false,
        message: "Error fetching favorite recipes",
      });
    }
  }

  async addToFavorites(req, res) {
    try {
      const result = await userService.addFavoriteRecipe(
        req.user._id,
        req.body
      );

      res.status(201).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Add favorite error:", error);

      if (
        error.message.includes("already in favorites") ||
        error.message.includes("already exists")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      if (
        error.message.includes("validation") ||
        error.message.includes("required")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(500).json({
        success: false,
        message: "Error adding recipe to favorites",
      });
    }
  }

  async removeFromFavorites(req, res) {
    try {
      const { recipeId } = req.params;
      const result = await userService.removeFavoriteRecipe(
        req.user._id,
        recipeId
      );

      res.json({
        success: true,
        ...result,
        removedRecipeId: recipeId,
      });
    } catch (error) {
      console.error("Remove favorite error:", error);

      if (error.message.includes("not found in favorites")) {
        return res.status(404).json({
          success: false,
          message: "Recipe not found in favorites",
        });
      }

      if (error.message.includes("User not found")) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(500).json({
        success: false,
        message: "Error removing recipe from favorites",
      });
    }
  }

  async checkFavoriteStatus(req, res) {
    try {
      const { recipeId } = req.params;
      const result = await userService.checkFavoriteStatus(
        req.user._id,
        recipeId
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Check favorite error:", error);

      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(500).json({
        success: false,
        message: "Error checking favorite status",
      });
    }
  }

  async getFavoritesByCategory(req, res) {
    try {
      const result = await userService.getFavoritesByCategory(req.user._id);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Get favorites by category error:", error);

      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(500).json({
        success: false,
        message: "Error fetching favorites by category",
      });
    }
  }

  async clearAllFavorites(req, res) {
    try {
      const result = await userService.clearAllFavorites(req.user._id);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Clear favorites error:", error);

      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(500).json({
        success: false,
        message: "Error clearing favorite recipes",
      });
    }
  }

  async getUserStats(req, res) {
    try {
      const result = await userService.getUserStats(req.user._id);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Get user stats error:", error);

      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(500).json({
        success: false,
        message: "Error fetching user statistics",
      });
    }
  }
}

module.exports = new UserController();
