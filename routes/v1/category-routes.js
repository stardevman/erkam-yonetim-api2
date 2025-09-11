const express = require("express");
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  updateCategoryParent,
} = require("../../controllers/v1/category-controller");

const router = express.Router();

// GET /v1/categories - Tüm kategorileri getir
// POST /v1/categories - Yeni kategori oluştur
router.route("/").get(getCategories).post(createCategory);

// PUT /v1/categories/reorder - Kategorileri yeniden sırala
router.route("/reorder").put(reorderCategories);

// GET /v1/categories/:id - Belirli bir kategoriyi getir
// PUT /v1/categories/:id - Belirli bir kategoriyi güncelle
// DELETE /v1/categories/:id - Belirli bir kategoriyi sil
router.route("/:id").get(getCategoryById).put(updateCategory).delete(deleteCategory);

// PUT /v1/categories/:id/parent - Kategorinin üst kategorisini güncelle
router.route("/:id/parent").put(updateCategoryParent);

module.exports = router;
