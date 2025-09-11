const mongoose = require("mongoose");

const translationSchema = new mongoose.Schema({
  books: [
    {
      isbn: { type: String, required: true },
      language: { type: String, required: true },
    },
  ],
});

const Translation = mongoose.model("Translation", translationSchema, "translations");

module.exports = Translation;
