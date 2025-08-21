const recipeRepository = require("../repositories/recipeRepository");

class RecipeService {
  async getAllCategories() {
    try {
      return await recipeRepository.getCategories();
    } catch (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
  }

  async getRecipesByCategory(category) {
    try {
      // Validate category
      if (!category || typeof category !== "string") {
        throw new Error("Category is required");
      }

      const trimmedCategory = category.trim();
      if (trimmedCategory.length === 0) {
        throw new Error("Category cannot be empty");
      }

      if (trimmedCategory.length > 50) {
        throw new Error("Category name too long");
      }

      return await recipeRepository.getRecipesByCategory(trimmedCategory);
    } catch (error) {
      throw error;
    }
  }

  async searchRecipes(searchTerm) {
    try {
      // Validate search term
      if (!searchTerm || typeof searchTerm !== "string") {
        throw new Error("Search term is required");
      }

      const trimmedSearchTerm = searchTerm.trim();
      if (trimmedSearchTerm.length === 0) {
        throw new Error("Search term cannot be empty");
      }

      if (trimmedSearchTerm.length > 100) {
        throw new Error("Search term too long");
      }

      // Basic validation for search term (alphanumeric and spaces only)
      if (!/^[a-zA-Z0-9\s]+$/.test(trimmedSearchTerm)) {
        throw new Error(
          "Search term can only contain letters, numbers, and spaces"
        );
      }

      const result = await recipeRepository.searchRecipes(trimmedSearchTerm);

      // If no results found, provide helpful message
      if (result.recipes.length === 0) {
        return {
          ...result,
          message: `No recipes found for "${trimmedSearchTerm}". Try different keywords or browse categories.`,
        };
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getRecipeDetails(recipeId) {
    try {
      // Validate recipe ID
      if (!recipeId || typeof recipeId !== "string") {
        throw new Error("Recipe ID is required");
      }

      const trimmedId = recipeId.trim();
      if (trimmedId.length === 0) {
        throw new Error("Recipe ID cannot be empty");
      }

      // Basic ID validation (should be numeric for TheMealDB)
      if (!/^\d+$/.test(trimmedId)) {
        throw new Error("Invalid recipe ID format");
      }

      return await recipeRepository.getRecipeDetails(trimmedId);
    } catch (error) {
      throw error;
    }
  }

  async getRandomRecipe() {
    try {
      return await recipeRepository.getRandomRecipe();
    } catch (error) {
      throw new Error(`Failed to fetch random recipe: ${error.message}`);
    }
  }

  async getFeaturedRecipes() {
    try {
      return await recipeRepository.getFeaturedRecipes();
    } catch (error) {
      throw new Error(`Failed to fetch featured recipes: ${error.message}`);
    }
  }

  async getRecipesByIngredient(ingredient) {
    try {
      // Validate ingredient
      if (!ingredient || typeof ingredient !== "string") {
        throw new Error("Ingredient is required");
      }

      const trimmedIngredient = ingredient.trim();
      if (trimmedIngredient.length === 0) {
        throw new Error("Ingredient cannot be empty");
      }

      if (trimmedIngredient.length > 50) {
        throw new Error("Ingredient name too long");
      }

      // Basic validation for ingredient (letters and spaces only)
      if (!/^[a-zA-Z\s]+$/.test(trimmedIngredient)) {
        throw new Error("Ingredient can only contain letters and spaces");
      }

      const result = await recipeRepository.getRecipesByIngredient(
        trimmedIngredient
      );

      if (result.recipes.length === 0) {
        return {
          ...result,
          message: `No recipes found with ingredient "${trimmedIngredient}".`,
        };
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getRecipesByArea(area) {
    try {
      // Validate area
      if (!area || typeof area !== "string") {
        throw new Error("Area is required");
      }

      const trimmedArea = area.trim();
      if (trimmedArea.length === 0) {
        throw new Error("Area cannot be empty");
      }

      if (trimmedArea.length > 50) {
        throw new Error("Area name too long");
      }

      // Basic validation for area (letters and spaces only)
      if (!/^[a-zA-Z\s]+$/.test(trimmedArea)) {
        throw new Error("Area can only contain letters and spaces");
      }

      const result = await recipeRepository.getRecipesByArea(trimmedArea);

      if (result.recipes.length === 0) {
        return {
          ...result,
          message: `No recipes found from area "${trimmedArea}".`,
        };
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getRecipeRecommendations(userId, preferences = {}) {
    try {
      // This could be enhanced with user preference analysis
      // For now, return featured recipes
      const featured = await this.getFeaturedRecipes();

      return {
        recommendations: featured.featured,
        message: "Recommendations based on popular categories",
        type: "featured",
      };
    } catch (error) {
      throw new Error(`Failed to get recommendations: ${error.message}`);
    }
  }

  async searchAdvanced(filters = {}) {
    try {
      const results = {};

      // Search by category if provided
      if (filters.category) {
        results.categoryResults = await this.getRecipesByCategory(
          filters.category
        );
      }

      // Search by ingredient if provided
      if (filters.ingredient) {
        results.ingredientResults = await this.getRecipesByIngredient(
          filters.ingredient
        );
      }

      // Search by area if provided
      if (filters.area) {
        results.areaResults = await this.getRecipesByArea(filters.area);
      }

      // Search by name if provided
      if (filters.name) {
        results.nameResults = await this.searchRecipes(filters.name);
      }

      return {
        results,
        filters: filters,
        message: "Advanced search results",
      };
    } catch (error) {
      throw error;
    }
  }

  // Utility methods
  async validateRecipeExists(recipeId) {
    try {
      await this.getRecipeDetails(recipeId);
      return true;
    } catch (error) {
      return false;
    }
  }

  formatRecipeForDisplay(recipe) {
    if (!recipe) return null;

    return {
      id: recipe.id || recipe.idMeal,
      name: recipe.name || recipe.strMeal,
      image: recipe.image || recipe.strMealThumb,
      category: recipe.category || recipe.strCategory,
      area: recipe.area || recipe.strArea,
      instructions: recipe.instructions || recipe.strInstructions,
      ingredients: recipe.ingredients || [],
      tags: recipe.tags || [],
      youtubeUrl: recipe.youtubeUrl || recipe.strYoutube,
      sourceUrl: recipe.sourceUrl || recipe.strSource,
    };
  }

  extractRecipePreview(recipe) {
    const formatted = this.formatRecipeForDisplay(recipe);

    return {
      id: formatted.id,
      name: formatted.name,
      image: formatted.image,
      category: formatted.category,
      area: formatted.area,
      // Short preview of instructions
      preview: formatted.instructions
        ? formatted.instructions.substring(0, 150) + "..."
        : "No instructions available",
      ingredientCount: formatted.ingredients ? formatted.ingredients.length : 0,
    };
  }

  getCacheStats() {
    return recipeRepository.getCacheStats();
  }

  clearCache() {
    return recipeRepository.clearCache();
  }
}

module.exports = new RecipeService();
