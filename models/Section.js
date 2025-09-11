const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    sectionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    isVisible: {
      type: Boolean,
      required: true,
      default: true,
    }
  },
  {
    timestamps: true, // createdAt ve updatedAt alanlarını otomatik ekler
  }
);

const Section = mongoose.model("Section", sectionSchema, "home_sections");

module.exports = Section;
