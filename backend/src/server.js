require("dotenv").config();

const app = require("./app");
const mysqlPool = require("./config/mysql");
const connectMongoDB = require("./config/mongodb");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test MySQL connection
    const connection = await mysqlPool.getConnection();

    console.log("MySQL connected successfully");

    connection.release();

    // Connect MongoDB
    await connectMongoDB();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

startServer();