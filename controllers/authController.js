const userService = require("../services/userService");

class AuthController {
  async register(req, res) {
    try {
      const result = await userService.registerUser(req.body);

      res.status(201).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Registration error:", error);

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Email address is already registered",
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

      if (error.message.includes("already exists")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Error creating user account",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  async login(req, res) {
    try {
      const result = await userService.loginUser(req.body);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Login error:", error);

      if (error.message.includes("Invalid email or password")) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      res.status(500).json({
        success: false,
        message: "Error during login",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  async getProfile(req, res) {
    try {
      const result = await userService.getUserProfile(req.user._id);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Get profile error:", error);

      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(500).json({
        success: false,
        message: "Error fetching user information",
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const result = await userService.updateUserProfile(
        req.user._id,
        req.body
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Profile update error:", error);

      if (
        error.message.includes("validation") ||
        error.message.includes("must be between")
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
        message: "Error updating profile",
      });
    }
  }

  async logout(req, res) {
    try {
      res.json({
        success: true,
        message:
          "Logout successful. Please remove the token from client storage.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        success: false,
        message: "Error during logout",
      });
    }
  }

  async deleteAccount(req, res) {
    try {
      const result = await userService.deleteUserAccount(req.user._id);

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Account deletion error:", error);

      if (error.message.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(500).json({
        success: false,
        message: "Error deactivating account",
      });
    }
  }
}

module.exports = new AuthController();
