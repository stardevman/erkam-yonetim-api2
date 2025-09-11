// require("dotenv").config();
// const { connectMongo, closeConnection } = require("../config/db-connect");
// const Author = require("../models/Author");

// const seedAuthors = [
//   {
//     name: "Erkam Güneysu",
//     description:
//       "Erkam Güneysu is a software engineer with a passion for building scalable applications.",
//     imageUrl: "https://example.com/images/erkam-guneysu.jpg",
//   },
//   {
//     name: "Ali Yılmaz",
//     description:
//       "Experienced full-stack developer specializing in JavaScript and Node.js.",
//     imageUrl: "https://example.com/images/ali-yilmaz.jpg",
//   },
//   {
//     name: "Ayşe Demir",
//     description:
//       "Frontend developer with expertise in React and modern web technologies.",
//     imageUrl: "https://example.com/images/ayse-demir.jpg",
//   },
// ];

// const seedDatabase = async () => {
//   try {
//     await connectMongo();
//     console.log("Connected to MongoDB");

//     // Mevcut verileri temizle
//     await Author.deleteMany({});
//     console.log("Existing authors deleted");

//     // Yeni verileri ekle
//     const createdAuthors = await Author.insertMany(seedAuthors);
//     console.log(`${createdAuthors.length} authors created successfully`);

//     console.log("Database seeded successfully!");
//   } catch (error) {
//     console.error("Error seeding database:", error);
//   } finally {
//     await closeConnection();
//     process.exit(0);
//   }
// };

// seedDatabase();
