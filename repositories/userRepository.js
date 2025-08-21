const User = require("../models/User");

class UserRepository {
  async createUser(userData) {
    try {
      const user = new User(userData);
      return await user.save();
    } catch (error) {
      throw error;
    }
  }

  async findUserByEmail(email) {
    try {
      return await User.findOne({ email, isActive: true });
    } catch (error) {
      throw error;
    }
  }

  async findUserByEmailWithPassword(email) {
    try {
      return await User.findOne({ email, isActive: true }).select("+password");
    } catch (error) {
      throw error;
    }
  }

  async findUserById(id) {
    try {
      return await User.findById(id);
    } catch (error) {
      throw error;
    }
  }

  async updateUser(id, updateData) {
    try {
      return await User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
    } catch (error) {
      throw error;
    }
  }

  async updateLastLogin(id) {
    try {
      return await User.findByIdAndUpdate(id, { lastLogin: new Date() });
    } catch (error) {
      throw error;
    }
  }

  async deactivateUser(id) {
    try {
      return await User.findByIdAndUpdate(id, { isActive: false });
    } catch (error) {
      throw error;
    }
  }

  async addFavoriteRecipe(userId, recipeData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Check if recipe already exists in favorites
      const existingFavorite = user.favoriteRecipes.find(
        (fav) => fav.recipeId === recipeData.recipeId
      );

      if (existingFavorite) {
        throw new Error("Recipe is already in favorites");
      }

      user.favoriteRecipes.push(recipeData);
      return await user.save();
    } catch (error) {
      throw error;
    }
  }

  async removeFavoriteRecipe(userId, recipeId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const favoriteIndex = user.favoriteRecipes.findIndex(
        (fav) => fav.recipeId === recipeId
      );

      if (favoriteIndex === -1) {
        throw new Error("Recipe not found in favorites");
      }

      user.favoriteRecipes.splice(favoriteIndex, 1);
      return await user.save();
    } catch (error) {
      throw error;
    }
  }

  async getFavoriteRecipes(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Sort favorites by most recently added
      const sortedFavorites = user.favoriteRecipes.sort(
        (a, b) => new Date(b.addedAt) - new Date(a.addedAt)
      );

      return sortedFavorites;
    } catch (error) {
      throw error;
    }
  }

  async clearAllFavorites(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      user.favoriteRecipes = [];
      return await user.save();
    } catch (error) {
      throw error;
    }
  }

  async checkFavoriteStatus(userId, recipeId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const isFavorite = user.favoriteRecipes.some(
        (fav) => fav.recipeId === recipeId
      );

      return isFavorite;
    } catch (error) {
      throw error;
    }
  }

  async getFavoritesByCategory(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Group favorites by category
      const favoritesByCategory = user.favoriteRecipes.reduce(
        (acc, favorite) => {
          const category = favorite.category;
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(favorite);
          return acc;
        },
        {}
      );

      // Sort each category by most recently added
      Object.keys(favoritesByCategory).forEach((category) => {
        favoritesByCategory[category].sort(
          (a, b) => new Date(b.addedAt) - new Date(a.addedAt)
        );
      });

      return favoritesByCategory;
    } catch (error) {
      throw error;
    }
  }

  async getUserStats(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const totalFavorites = user.favoriteRecipes.length;
      const categoriesCount = new Set(
        user.favoriteRecipes.map((fav) => fav.category)
      ).size;

      // Most popular category
      const categoryFrequency = user.favoriteRecipes.reduce((acc, fav) => {
        acc[fav.category] = (acc[fav.category] || 0) + 1;
        return acc;
      }, {});

      const mostPopularCategory = Object.keys(categoryFrequency).reduce(
        (a, b) => (categoryFrequency[a] > categoryFrequency[b] ? a : b),
        null
      );

      // Recent activity (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const recentFavorites = user.favoriteRecipes.filter(
        (fav) => new Date(fav.addedAt) > weekAgo
      ).length;

      return {
        totalFavorites,
        categoriesCount,
        mostPopularCategory,
        mostPopularCategoryCount: mostPopularCategory
          ? categoryFrequency[mostPopularCategory]
          : 0,
        recentFavorites,
        accountAge: Math.floor(
          (Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)
        ),
        lastLogin: user.lastLogin,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserRepository();
