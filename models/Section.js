const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
        //required: true,
      trim: true,
    },
    type: {
      type: String,
      default: "book_list",
      //enum: ["banner_carousel", "book_list"],
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true, // createdAt ve updatedAt alanlarını otomatik ekler
  }
);

const Section = mongoose.model("Section", sectionSchema, "home_sections");

module.exports = Section;
