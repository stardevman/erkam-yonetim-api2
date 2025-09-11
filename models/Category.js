const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    nameEn: {
      type: String,
      trim: true,
    },
    nameAr: {
      type: String,
      trim: true,
    },
    nameFr: {
      type: String,
      trim: true,
    },
    nameDe: {
      type: String,
      trim: true,
    },
    nameEs: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0, // Varsayılan sıralama değeri
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null, // Üst kategori yoksa null
    },
    createdBy: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // createdAt ve updatedAt alanlarını otomatik ekler
  }
);

const Category = mongoose.model("Category", categorySchema, "categories");

module.exports = Category;
