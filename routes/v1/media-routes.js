const express = require("express");
const router = express.Router();
const {
  uploadSingleImage,
  uploadSingleDocument,
  uploadAnyFile,
} = require("../../middleware/upload-middleware");
const {
  uploadImage,
  uploadDocument,
  uploadFile,
  deleteFile,
  getFileInfo,
  listMediaFiles,
  getMediaStats,
} = require("../../controllers/v1/media-controller");

// GET /v1/media - Tüm media dosyalarını listele (pagination ile)
router.get("/", listMediaFiles);

// GET /v1/media/stats - Media istatistikleri
router.get("/stats", getMediaStats);

// POST /v1/media/image - Resim yükle
router.post("/image", uploadSingleImage, uploadImage);

// POST /v1/media/document - Döküman yükle
router.post("/document", uploadSingleDocument, uploadDocument);

// POST /v1/media/upload - Herhangi bir dosya yükle (otomatik tip algılama)
router.post("/upload", uploadAnyFile, uploadFile);

// DELETE /v1/media - Dosya sil
router.delete("/", deleteFile);

// POST /v1/media/info - Dosya bilgilerini getir (URL'den)
router.post("/info", getFileInfo);

module.exports = router;
