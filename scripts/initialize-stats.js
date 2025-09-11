const mongoose = require("mongoose");
const Book = require("../models/Book");
const Author = require("../models/Author");
const Category = require("../models/Category");
const User = require("../models/User");
const Stats = require("../models/Stats");
const { connectMongo, closeConnection } = require("../config/db-connect");

const initializeStats = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await connectMongo();

    console.log("Initializing stats collection...");

    // Count existing documents
    const booksCount = await Book.countDocuments();
    const authorsCount = await Author.countDocuments();
    const categoriesCount = await Category.countDocuments();
    const usersCount = await User.countDocuments();

    console.log(`Found ${booksCount} books`);
    console.log(`Found ${authorsCount} authors`);
    console.log(`Found ${categoriesCount} categories`);
    console.log(`Found ${usersCount} users`);

    // Initialize or update stats
    await Stats.setCount("books", booksCount);
    await Stats.setCount("authors", authorsCount);
    await Stats.setCount("categories", categoriesCount);
    await Stats.setCount("users", usersCount);

    console.log("Stats collection initialized successfully!");

    // Verify the stats
    const stats = await Stats.find();
    console.log("Current stats:", stats);

    await closeConnection();
    process.exit(0);
  } catch (error) {
    console.error("Error initializing stats:", error);
    await closeConnection();
    process.exit(1);
  }
};

initializeStats();
