const express = require("express");
const {
  getTranslationsById,
  addBookToTranslation,
  removeBookFromTranslation,
} = require("../../controllers/v1/translation-controller");

const router = express.Router();

// GET /v1/translations - Tüm çevirileri ID'ye göre getir
router.route("/").get(getTranslationsById);

// POST /v1/translations - Çeviriye kitap ekle
router.route("/").post(addBookToTranslation);

// DELETE /v1/translations/:id - Çeviriden kitap çıkar
router.route("/:id").delete(removeBookFromTranslation);

module.exports = router;
