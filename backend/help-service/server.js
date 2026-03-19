const connectDB = require("./config/db");
const app = require("./serverApp");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`🚀 Help Service running on port ${PORT}`));
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
