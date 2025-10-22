const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    isbn: {
      type: String,
      //required: true,
      unique: true,
      trim: true,
    },
    persons: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Person",
      //required: true,
      default: [],
    },
    leadAuthor: {
      type: String,
      trim: true,
    },
    pages: {
      type: Number,
      //required: true,
      default: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      //required: true,
      trim: true,
    },
    categories: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Category",
      required: false,
    },
    image: {
      type: mongoose.Schema.Types.Mixed,
      ref: "Media",
      default: {
        mediaId: "",
        url: "",
      },
      //required: true,
    },
    file: {
      type: mongoose.Schema.Types.Mixed,
      ref: "Media",
       default: {
        mediaId: "",
        url: "",
      },
      //required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: String,
      required: true,
      trim: true,
    },
    updatedBy: {
      type: String,
      required: true,
      trim: true,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    isDraft: {
      type: Boolean,
      default: false,
    },
    language: {
      type: String,
      //enum: ["tr", "en", "ar", "fr", "de", "es", "it", "ru", "zh"], // Desteklenen diller
      default: "tr",
    },
    relatedBook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: false,
    },
    translationsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Translation",
      required: false,
    },
    keywords: {
      type: String,
      required: false,
    },
    printBookUrl: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true, // createdAt ve updatedAt alanlarını otomatik ekler
  }
);

const Book = mongoose.model("Book", bookSchema, "books");

module.exports = Book;
