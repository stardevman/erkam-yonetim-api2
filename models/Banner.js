const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
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
    // imageUrl: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },
    items: [
      {
        imageUrl: {
          type: String,
          required: true,
          trim: true,
        },
        relatedBook: {
          isbn: { type: String, required: true },
          title: { type: String, required: true },
        },
      },
    ],
  },
  {
    timestamps: true, // createdAt ve updatedAt alanlarını otomatik ekler
  }
);

const Banner = mongoose.model("Banner", bannerSchema, "banners");

module.exports = Banner;
