const express = require("express");
const {
  getHomeSections,
  createHomeSection,
  updateHomeSections,
  deleteHomeSection
} = require("../../controllers/v1/section-controller.js");

const router = express.Router();

// GET /v1/sections - Tüm bölümleri getir
// PUT /v1/sections - Bölümleri güncelle
router.route("/").get(getHomeSections).post(createHomeSection).put(updateHomeSections);

// DELETE /v1/sections/:id - Bölüm sil
router.route("/:id").delete(deleteHomeSection);

module.exports = router;
