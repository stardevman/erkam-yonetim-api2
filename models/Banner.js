const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    items: [
      {
        imageUrl: {
          type: String,
          required: true,
          trim: true,
        },
        link: {
          type: String,
          required: false,
          trim: true,
          default: "",
        },
      }
    ],
  },
  {
    timestamps: true, // createdAt ve updatedAt alanlarını otomatik ekler
  }
);

const Banner = mongoose.model("Banner", bannerSchema, "banners");

module.exports = Banner;
