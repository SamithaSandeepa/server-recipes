const userRepository = require("../repositories/userRepository");
const { generateToken } = require("../middleware/auth");

class UserService {
  async registerUser(userData) {
    try {
      const { name, email, password } = userData;

      // Check if user already exists
      const existingUser = await userRepository.findUserByEmail(email);
      if (existingUser) {
        throw new Error("User already exists with this email address");
      }

      // Create new user
      const user = await userRepository.createUser({
        name,
        email,
        password,
      });

      // Generate JWT token
      const token = generateToken(user._id);

      return {
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          favoriteRecipes: user.favoriteRecipes,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async loginUser(credentials) {
    try {
      const { email, password } = credentials;

      // Find user and include password field
      const user = await userRepository.findUserByEmailWithPassword(email);

      if (!user || !user.isActive) {
        throw new Error("Invalid email or password");
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        throw new Error("Invalid email or password");
      }

      // Update last login
      await userRepository.updateLastLogin(user._id);

      // Generate JWT token
      const token = generateToken(user._id);

      return {
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          favoriteRecipes: user.favoriteRecipes,
          lastLogin: new Date(),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async getUserProfile(userId) {
    try {
      const user = await userRepository.findUserById(userId);

      if (!user) {
        throw new Error("User not found");
      }

      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          favoriteRecipes: user.favoriteRecipes,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async updateUserProfile(userId, updateData) {
    try {
      const { name } = updateData;

      // Validate name
      if (!name || name.trim().length < 2 || name.trim().length > 50) {
        throw new Error("Name must be between 2 and 50 characters");
      }

      // Update user
      const user = await userRepository.updateUser(userId, {
        name: name.trim(),
      });

      if (!user) {
        throw new Error("User not found");
      }

      return {
        message: "Profile updated successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          favoriteRecipes: user.favoriteRecipes,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteUserAccount(userId) {
    try {
      const user = await userRepository.deactivateUser(userId);

      if (!user) {
        throw new Error("User not found");
      }

      return {
        message: "Account deactivated successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  async addFavoriteRecipe(userId, recipeData) {
    try {
      const { recipeId, recipeName, recipeImage, category } = recipeData;

      // Validate recipe data
      if (!recipeId || !recipeName || !recipeImage || !category) {
        throw new Error("All recipe fields are required");
      }

      const favoriteData = {
        recipeId,
        recipeName,
        recipeImage,
        category,
        addedAt: new Date(),
      };

      const user = await userRepository.addFavoriteRecipe(userId, favoriteData);

      return {
        message: "Recipe added to favorites successfully",
        favorite: favoriteData,
        totalFavorites: user.favoriteRecipes.length,
      };
    } catch (error) {
      throw error;
    }
  }

  async removeFavoriteRecipe(userId, recipeId) {
    try {
      const user = await userRepository.removeFavoriteRecipe(userId, recipeId);

      return {
        message: "Recipe removed from favorites successfully",
        totalFavorites: user.favoriteRecipes.length,
      };
    } catch (error) {
      throw error;
    }
  }

  async getFavoriteRecipes(userId) {
    try {
      const favorites = await userRepository.getFavoriteRecipes(userId);

      return {
        favorites,
        count: favorites.length,
      };
    } catch (error) {
      throw error;
    }
  }

  async clearAllFavorites(userId) {
    try {
      const user = await userRepository.clearAllFavorites(userId);
      const previousCount = user.favoriteRecipes.length;

      return {
        message: "All favorite recipes cleared successfully",
        clearedCount: previousCount,
      };
    } catch (error) {
      throw error;
    }
  }

  async checkFavoriteStatus(userId, recipeId) {
    try {
      const isFavorite = await userRepository.checkFavoriteStatus(
        userId,
        recipeId
      );

      return {
        recipeId,
        isFavorite,
      };
    } catch (error) {
      throw error;
    }
  }

  async getFavoritesByCategory(userId) {
    try {
      const favoritesByCategory = await userRepository.getFavoritesByCategory(
        userId
      );

      return {
        favoritesByCategory,
        totalCategories: Object.keys(favoritesByCategory).length,
      };
    } catch (error) {
      throw error;
    }
  }

  async getUserStats(userId) {
    try {
      const stats = await userRepository.getUserStats(userId);

      return {
        stats,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserService();
