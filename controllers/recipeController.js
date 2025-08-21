const recipeService = require("../services/recipeService");

class RecipeController {
  async getCategories(req, res) {
    try {
      const result = await recipeService.getAllCategories();

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Categories fetch error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching categories",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "External API error",
      });
    }
  }

  async getRecipesByCategory(req, res) {
    try {
      const { category } = req.params;
      const result = await recipeService.getRecipesByCategory(category);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Recipes by category fetch error:", error);

      if (
        error.message.includes("Category") &&
        error.message.includes("required")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Error fetching recipes by category",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "External API error",
      });
    }
  }

  async searchRecipes(req, res) {
    try {
      const { search } = req.query;

      if (!search) {
        return res.status(400).json({
          success: false,
          message: "Search term is required",
        });
      }

      const result = await recipeService.searchRecipes(search);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Recipe search error:", error);

      if (
        error.message.includes("Search term") ||
        error.message.includes("validation")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Error searching recipes",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "External API error",
      });
    }
  }

  async getRecipeDetails(req, res) {
    try {
      const { id } = req.params;
      const result = await recipeService.getRecipeDetails(id);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Recipe details fetch error:", error);

      if (
        error.message.includes("Recipe ID") ||
        error.message.includes("Invalid recipe ID")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: `Recipe not found with ID: ${req.params.id}`,
        });
      }

      res.status(500).json({
        success: false,
        message: "Error fetching recipe details",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "External API error",
      });
    }
  }

  async getRandomRecipe(req, res) {
    try {
      const result = await recipeService.getRandomRecipe();

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Random recipe fetch error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching random recipe",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "External API error",
      });
    }
  }

  async getFeaturedRecipes(req, res) {
    try {
      const result = await recipeService.getFeaturedRecipes();

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Featured recipes fetch error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching featured recipes",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "External API error",
      });
    }
  }

  async getRecipesByIngredient(req, res) {
    try {
      const { ingredient } = req.params;
      const result = await recipeService.getRecipesByIngredient(ingredient);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Recipes by ingredient fetch error:", error);

      if (
        error.message.includes("Ingredient") &&
        error.message.includes("required")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Error fetching recipes by ingredient",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "External API error",
      });
    }
  }

  async getRecipesByArea(req, res) {
    try {
      const { area } = req.params;
      const result = await recipeService.getRecipesByArea(area);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Recipes by area fetch error:", error);

      if (
        error.message.includes("Area") &&
        error.message.includes("required")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Error fetching recipes by area",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "External API error",
      });
    }
  }

  async getRecommendations(req, res) {
    try {
      const userId = req.user ? req.user._id : null;
      const result = await recipeService.getRecipeRecommendations(
        userId,
        req.query
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Recommendations fetch error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching recipe recommendations",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "External API error",
      });
    }
  }

  async searchAdvanced(req, res) {
    try {
      const result = await recipeService.searchAdvanced(req.query);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Advanced search error:", error);

      if (
        error.message.includes("validation") ||
        error.message.includes("required")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Error in advanced search",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "External API error",
      });
    }
  }

  async getCacheStats(req, res) {
    try {
      const stats = recipeService.getCacheStats();

      res.json({
        success: true,
        cache: stats,
      });
    } catch (error) {
      console.error("Cache stats error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching cache statistics",
      });
    }
  }

  async clearCache(req, res) {
    try {
      recipeService.clearCache();

      res.json({
        success: true,
        message: "Cache cleared successfully",
      });
    } catch (error) {
      console.error("Clear cache error:", error);
      res.status(500).json({
        success: false,
        message: "Error clearing cache",
      });
    }
  }
}

module.exports = new RecipeController();
