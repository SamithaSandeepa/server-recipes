const axios = require("axios");

class RecipeRepository {
  constructor() {
    this.baseUrl =
      process.env.THEMEALDB_API_URL ||
      "https://www.themealdb.com/api/json/v1/1";
    this.cache = new Map();
    this.cacheTimeout = 60 * 60 * 1000; // 1 hour
  }

  // Cache management
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  clearCache() {
    this.cache.clear();
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  // API methods
  async getCategories() {
    try {
      const cacheKey = "categories";
      const cached = this.getCache(cacheKey);

      if (cached) {
        return { categories: cached, cached: true };
      }

      const response = await axios.get(`${this.baseUrl}/categories.php`);

      if (!response.data || !response.data.categories) {
        throw new Error("No categories found");
      }

      this.setCache(cacheKey, response.data.categories);

      return {
        categories: response.data.categories,
        cached: false,
      };
    } catch (error) {
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
  }

  async getRecipesByCategory(category) {
    try {
      const cacheKey = `category_${category}`;
      const cached = this.getCache(cacheKey);

      if (cached) {
        return cached;
      }

      const response = await axios.get(
        `${this.baseUrl}/filter.php?c=${encodeURIComponent(category)}`
      );

      if (!response.data || !response.data.meals) {
        return {
          category,
          recipes: [],
          count: 0,
          message: `No recipes found for category: ${category}`,
        };
      }

      const result = {
        category,
        recipes: response.data.meals,
        count: response.data.meals.length,
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      throw new Error(`Failed to fetch recipes by category: ${error.message}`);
    }
  }

  async searchRecipes(searchTerm) {
    try {
      const cacheKey = `search_${searchTerm}`;
      const cached = this.getCache(cacheKey);

      if (cached) {
        return cached;
      }

      const response = await axios.get(
        `${this.baseUrl}/search.php?s=${encodeURIComponent(searchTerm)}`
      );

      if (!response.data || !response.data.meals) {
        return {
          searchTerm,
          recipes: [],
          count: 0,
          message: `No recipes found for search term: ${searchTerm}`,
        };
      }

      const result = {
        searchTerm,
        recipes: response.data.meals,
        count: response.data.meals.length,
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      throw new Error(`Failed to search recipes: ${error.message}`);
    }
  }

  async getRecipeDetails(recipeId) {
    try {
      const cacheKey = `recipe_${recipeId}`;
      const cached = this.getCache(cacheKey);

      if (cached) {
        return cached;
      }

      const response = await axios.get(
        `${this.baseUrl}/lookup.php?i=${encodeURIComponent(recipeId)}`
      );

      if (
        !response.data ||
        !response.data.meals ||
        response.data.meals.length === 0
      ) {
        throw new Error(`Recipe not found with ID: ${recipeId}`);
      }

      const recipe = response.data.meals[0];

      // Extract ingredients and measurements
      const ingredients = [];
      for (let i = 1; i <= 20; i++) {
        const ingredient = recipe[`strIngredient${i}`];
        const measurement = recipe[`strMeasure${i}`];

        if (ingredient && ingredient.trim()) {
          ingredients.push({
            name: ingredient.trim(),
            measurement: measurement ? measurement.trim() : "",
          });
        }
      }

      // Structure the recipe data
      const structuredRecipe = {
        id: recipe.idMeal,
        name: recipe.strMeal,
        category: recipe.strCategory,
        area: recipe.strArea,
        instructions: recipe.strInstructions,
        image: recipe.strMealThumb,
        tags: recipe.strTags
          ? recipe.strTags.split(",").map((tag) => tag.trim())
          : [],
        ingredients,
        youtubeUrl: recipe.strYoutube,
        sourceUrl: recipe.strSource,
      };

      const result = { recipe: structuredRecipe };
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      throw new Error(`Failed to fetch recipe details: ${error.message}`);
    }
  }

  async getRandomRecipe() {
    try {
      const response = await axios.get(`${this.baseUrl}/random.php`);

      if (
        !response.data ||
        !response.data.meals ||
        response.data.meals.length === 0
      ) {
        throw new Error("No random recipe found");
      }

      const recipe = response.data.meals[0];

      // Extract ingredients and measurements
      const ingredients = [];
      for (let i = 1; i <= 20; i++) {
        const ingredient = recipe[`strIngredient${i}`];
        const measurement = recipe[`strMeasure${i}`];

        if (ingredient && ingredient.trim()) {
          ingredients.push({
            name: ingredient.trim(),
            measurement: measurement ? measurement.trim() : "",
          });
        }
      }

      // Structure the recipe data
      const structuredRecipe = {
        id: recipe.idMeal,
        name: recipe.strMeal,
        category: recipe.strCategory,
        area: recipe.strArea,
        instructions: recipe.strInstructions,
        image: recipe.strMealThumb,
        tags: recipe.strTags
          ? recipe.strTags.split(",").map((tag) => tag.trim())
          : [],
        ingredients,
        youtubeUrl: recipe.strYoutube,
        sourceUrl: recipe.strSource,
      };

      return { recipe: structuredRecipe };
    } catch (error) {
      throw new Error(`Failed to fetch random recipe: ${error.message}`);
    }
  }

  async getFeaturedRecipes() {
    try {
      const cacheKey = "featured_recipes";
      const cached = this.getCache(cacheKey);

      if (cached) {
        return cached;
      }

      // Featured categories
      const featuredCategories = [
        "Seafood",
        "Chicken",
        "Dessert",
        "Vegetarian",
        "Pasta",
      ];
      const featuredRecipes = {};

      // Fetch recipes for each featured category
      const promises = featuredCategories.map(async (category) => {
        try {
          const response = await axios.get(
            `${this.baseUrl}/filter.php?c=${encodeURIComponent(category)}`
          );
          if (response.data && response.data.meals) {
            // Get first 6 recipes from each category
            featuredRecipes[category] = response.data.meals.slice(0, 6);
          }
        } catch (error) {
          console.error(`Error fetching ${category} recipes:`, error);
          featuredRecipes[category] = [];
        }
      });

      await Promise.all(promises);

      const result = {
        featured: featuredRecipes,
        categories: featuredCategories,
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      throw new Error(`Failed to fetch featured recipes: ${error.message}`);
    }
  }

  async getRecipesByIngredient(ingredient) {
    try {
      const cacheKey = `ingredient_${ingredient}`;
      const cached = this.getCache(cacheKey);

      if (cached) {
        return cached;
      }

      const response = await axios.get(
        `${this.baseUrl}/filter.php?i=${encodeURIComponent(ingredient)}`
      );

      if (!response.data || !response.data.meals) {
        return {
          ingredient,
          recipes: [],
          count: 0,
          message: `No recipes found with ingredient: ${ingredient}`,
        };
      }

      const result = {
        ingredient,
        recipes: response.data.meals,
        count: response.data.meals.length,
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      throw new Error(
        `Failed to fetch recipes by ingredient: ${error.message}`
      );
    }
  }

  async getRecipesByArea(area) {
    try {
      const cacheKey = `area_${area}`;
      const cached = this.getCache(cacheKey);

      if (cached) {
        return cached;
      }

      const response = await axios.get(
        `${this.baseUrl}/filter.php?a=${encodeURIComponent(area)}`
      );

      if (!response.data || !response.data.meals) {
        return {
          area,
          recipes: [],
          count: 0,
          message: `No recipes found from area: ${area}`,
        };
      }

      const result = {
        area,
        recipes: response.data.meals,
        count: response.data.meals.length,
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      throw new Error(`Failed to fetch recipes by area: ${error.message}`);
    }
  }
}

module.exports = new RecipeRepository();
