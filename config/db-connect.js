const mongoose = require("mongoose");
require("dotenv").config();

const connectMongo = async () => {
  try {
    const connection = await mongoose.connect(process.env.DATABASE_URL, {
      dbName: process.env.DATABASE_NAME,
    });

    console.log(`MongoDB connected: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

const closeConnection = async () => {
  try {
    await mongoose.connection.close();
    console.log("Connection to MongoDB closed");
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
  }
};

module.exports = { connectMongo, closeConnection };
