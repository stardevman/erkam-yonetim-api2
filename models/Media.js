const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    mediaId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // createdAt ve updatedAt alanlarını otomatik ekler
  }
);

const Media = mongoose.model("Media", mediaSchema, "media");

module.exports = Media;
