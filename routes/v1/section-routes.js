const express = require("express");
const {
  getHomeSections,
  updateHomeSections,
} = require("../../controllers/v1/section-controller.js");

const router = express.Router();

// GET /v1/sections - Tüm bölümleri getir
// PUT /v1/sections - Bölümleri güncelle
router.route("/").get(getHomeSections).put(updateHomeSections);

module.exports = router;
