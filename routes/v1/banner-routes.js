const express = require("express");
const {
  getBanners,
  updateBanner,
} = require("../../controllers/v1/banner-controller.js");

const router = express.Router();

// GET /v1/banners - Tüm banner öğelerini getir
router.route("/").get(getBanners);

// PUT /v1/banners/:id - Belirli bir banner'ı güncelle
router.put("/:id", updateBanner);

module.exports = router;
