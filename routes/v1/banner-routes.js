const express = require("express");
const {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} = require("../../controllers/v1/banner-controller.js");

const router = express.Router();

// GET /v1/banners - Tüm banner öğelerini getir
router.route("/").get(getBanners).post(createBanner).delete(deleteBanner);

// PUT /v1/banners/:id - Belirli bir banner'ı güncelle
router.put("/:id", updateBanner);

module.exports = router;
