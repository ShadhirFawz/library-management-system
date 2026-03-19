const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("[book-catalog-service] MongoDB connected");
  } catch (error) {
    console.error(
      "[book-catalog-service] MongoDB connection error:",
      error.message,
    );
    process.exit(1);
  }
};

module.exports = connectDB;
