const mongoose = require("mongoose");

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      const mongoURI =
        process.env.MONGODB_URI || "mongodb://localhost:27017/recipe-explorer";

      this.connection = await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      console.log(`MongoDB Connected: ${this.connection.connection.host}`);

      // Handle connection events
      mongoose.connection.on("error", (err) => {
        console.error("MongoDB connection error:", err);
      });

      mongoose.connection.on("disconnected", () => {
        console.log("MongoDB disconnected");
        this.connection = null;
      });

      mongoose.connection.on("reconnected", () => {
        console.log("MongoDB reconnected");
      });

      // Graceful shutdown
      process.on("SIGINT", async () => {
        await this.disconnect();
        process.exit(0);
      });

      process.on("SIGTERM", async () => {
        await this.disconnect();
        process.exit(0);
      });
    } catch (error) {
      console.error("Error connecting to MongoDB:", error.message);
      process.exit(1);
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.connection.close();
        console.log("MongoDB connection closed");
        this.connection = null;
      }
    } catch (error) {
      console.error("Error disconnecting from MongoDB:", error);
    }
  }

  isConnected() {
    return mongoose.connection.readyState === 1;
  }
}

module.exports = new Database();
