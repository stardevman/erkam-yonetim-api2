const express = require("express");
const {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
  searchBooks,
  uploadBookImage,
  uploadBookDocument,
  exportBooksCSV,
} = require("../../controllers/v1/book-controller");
const {
  uploadBookFiles,
  uploadSingleImage,
  uploadSingleDocument,
} = require("../../middleware/upload-middleware");

const router = express.Router();

// GET /v1/books - Tüm kitapları getir
// POST /v1/books - Yeni kitap oluştur (with file upload)
router.route("/").get(getBooks).post(uploadBookFiles, createBook);

// GET /v1/books/search - Kitapları filtreleme ve arama
router.route("/search").get(searchBooks);

// GET /v1/books/export/csv - Tüm kitapları CSV formatında export et
router.route("/export/csv").get(exportBooksCSV);

// PUT /v1/books/:isbn/image - Sadece kitap resmini güncelle
router.route("/:isbn/image").put(uploadSingleImage, uploadBookImage);

// PUT /v1/books/:isbn/document - Sadece kitap dosyasını güncelle
router.route("/:isbn/document").put(uploadSingleDocument, uploadBookDocument);

// GET /v1/books/:id - Belirli bir kitabı getir
// PUT /v1/books/:id - Belirli bir kitabı güncelle (with optional file upload)
// DELETE /v1/books/:id - Belirli bir kitabı sil
router
  .route("/:id")
  .get(getBook)
  .put(uploadBookFiles, updateBook)
  .delete(deleteBook);

module.exports = router;
