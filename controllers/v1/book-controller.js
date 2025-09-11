const bookService = require("../../services/v1/book-service");
const FileUploadService = require("../../services/file-upload-service");
const MediaService = require("../../services/v1/media-service");

exports.getBooks = async (req, res) => {
  try {
    const { limit, page } = req.query;
    const result = await bookService.getBooks({ limit, page });
    res.status(200).json({
      success: true,
      data: result.books,
      pagination: result.pagination,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getBookByIsbn = async (req, res) => {
  try {
    const { isbn } = req.params;
    const book = await bookService.getBookByIsbn(isbn);
    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (err) {
    if (err.message === "Book not found") {
      res.status(404).json({
        success: false,
        error: err.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }
};

exports.createBook = async (req, res) => {
  try {
    const bookData = req.body;

    // // Media ID'leri gerekli. Frontend'deki media seçimi sonrası bu ID'ler gönderilmeli
    // if (!bookData.imageId || !bookData.fileId) {
    //   return res.status(400).json({
    //     success: false,
    //     error: "Both imageId and fileId are required",
    //   });
    // }

    try {
      // Resim media'sını al
      if (bookData.imageId && bookData.imageId !== "") {
        const imageMedia = await MediaService.getMediaById(bookData.imageId);
        if (imageMedia.type !== "image") {
          return res.status(400).json({
            success: false,
            error: "Selected media for image is not an image file",
          });
        }
        bookData.image = {
          mediaId: bookData.imageId,
          url: imageMedia.url,
        };

        // Media ID'sini temizle (veritabanına kaydedilmesin)
        delete bookData.imageId;
      }

      // Döküman media'sını al
      if (bookData.fileId && bookData.fileId !== "") {
        const documentMedia = await MediaService.getMediaById(bookData.fileId);
        if (documentMedia.type !== "document") {
          return res.status(400).json({
            success: false,
            error: "Selected media for document is not a document file",
          });
        }
        bookData.file = {
          mediaId: bookData.fileId,
          url: documentMedia.url,
        };

        // Media ID'sini temizle (veritabanına kaydedilmesin)
        delete bookData.fileId;
      }
    } catch (error) {
      console.error("Error selecting media:", error);
      return res.status(400).json({
        success: false,
        error: `Media selection failed: ${error.message}`,
      });
    }

    const newBook = await bookService.createBook(bookData);
    res.status(201).json({
      success: true,
      data: newBook,
    });
  } catch (err) {
    console.error("Error creating book:", err);
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

exports.updateBook = async (req, res) => {
  const updateData = req.body;
  try {
    // Media ID'leri varsa URL'leri al
    if (updateData.imageId) {
      try {
        const imageMedia = await MediaService.getMediaById(updateData.imageId);
        if (imageMedia.type !== "image") {
          return res.status(400).json({
            success: false,
            error: "Selected media for image is not an image file",
          });
        }
        updateData.image = {
          mediaId: updateData.imageId,
          url: imageMedia.url,
        };
        // Media ID'sini temizle (veritabanına kaydedilmesin)
        delete updateData.imageId;
      } catch (error) {
        console.error("Error selecting image media:", error);
        return res.status(400).json({
          success: false,
          error: `Image media selection failed: ${error.message}`,
        });
      }
    }

    if (updateData.fileId) {
      try {
        const documentMedia = await MediaService.getMediaById(updateData.fileId);
        if (documentMedia.type !== "document") {
          return res.status(400).json({
            success: false,
            error: "Selected media for document is not a document file",
          });
        }
        updateData.file = {
          mediaId: updateData.fileId,
          url: documentMedia.url,
        };
        // Media ID'sini temizle (veritabanına kaydedilmesin)
        delete updateData.fileId;
      } catch (error) {
        console.error("Error selecting document media:", error);
        return res.status(400).json({
          success: false,
          error: `Document media selection failed: ${error.message}`,
        });
      }
    }

    const updatedBook = await bookService.updateBook(updateData);
    res.status(200).json({
      success: true,
      data: updatedBook,
    });
  } catch (err) {
    if (err.message === "Book not found") {
      res.status(404).json({
        success: false,
        error: err.message,
      });
    } else {
      console.log(err);
      res.status(400).json({
        success: false,
        error: err.message,
      });
    }
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { isbn } = req.params;

    // Delete the book from database
    await bookService.deleteBook(isbn);

    res.status(200).json({
      success: true,
      message: "Book and associated files deleted successfully",
    });
  } catch (err) {
    if (err.message === "Book not found") {
      res.status(404).json({
        success: false,
        error: err.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }
};

exports.searchBooks = async (req, res) => {
  try {
    const { query, author, isbn, language, limit, page, sortField, sortOrder } =
      req.query;

    // Arama servisini çağır
    const result = await bookService.searchBooks({
      query,
      author,
      isbn,
      language,
      limit,
      page,
      sortField,
      sortOrder,
    });

    res.status(200).json({
      success: true,
      data: result.books,
      pagination: result.pagination,
    });
  } catch (err) {
    console.error("Search books controller error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Upload only image for a book
exports.uploadBookImage = async (req, res) => {
  try {
    const { isbn } = req.params;
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({
        success: false,
        error: "Image file is required",
      });
    }

    // Validate image
    const imageValidation = FileUploadService.validateFile(imageFile, "image");
    if (!imageValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: `Image validation failed: ${imageValidation.error}`,
      });
    }

    // Get old book data to delete old image
    const oldBook = await bookService.getBookByIsbn(isbn);

    // Upload new image
    const imageUrl = await FileUploadService.uploadFile(
      imageFile.buffer,
      imageFile.originalname,
      "images"
    );

    // Update book with new image URL
    const updateData = { imageUrl };
    const updatedBook = await bookService.updateBook(isbn, updateData);

    // Delete old image if exists
    if (oldBook.imageUrl) {
      try {
        await FileUploadService.deleteFile(oldBook.imageUrl);
      } catch (error) {
        console.warn("Failed to delete old image:", error.message);
      }
    }

    res.status(200).json({
      success: true,
      data: updatedBook,
      message: "Book image updated successfully",
    });
  } catch (err) {
    if (err.message === "Book not found") {
      res.status(404).json({
        success: false,
        error: err.message,
      });
    } else {
      res.status(400).json({
        success: false,
        error: err.message,
      });
    }
  }
};

// Upload only document for a book
exports.uploadBookDocument = async (req, res) => {
  try {
    const { isbn } = req.params;
    const documentFile = req.file;

    if (!documentFile) {
      return res.status(400).json({
        success: false,
        error: "Document file is required",
      });
    }

    // Validate document
    const documentValidation = FileUploadService.validateFile(
      documentFile,
      "document"
    );
    if (!documentValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: `Document validation failed: ${documentValidation.error}`,
      });
    }

    // Get old book data to delete old document
    const oldBook = await bookService.getBookByIsbn(isbn);

    // Upload new document
    const fileUrl = await FileUploadService.uploadFile(
      documentFile.buffer,
      documentFile.originalname,
      "documents"
    );

    // Update book with new document URL
    const updateData = { fileUrl };
    const updatedBook = await bookService.updateBook(isbn, updateData);

    // Delete old document if exists
    if (oldBook.fileUrl) {
      try {
        await FileUploadService.deleteFile(oldBook.fileUrl);
      } catch (error) {
        console.warn("Failed to delete old document:", error.message);
      }
    }

    res.status(200).json({
      success: true,
      data: updatedBook,
      message: "Book document updated successfully",
    });
  } catch (err) {
    if (err.message === "Book not found") {
      res.status(404).json({
        success: false,
        error: err.message,
      });
    } else {
      res.status(400).json({
        success: false,
        error: err.message,
      });
    }
  }
};

exports.exportBooksCSV = async (req, res) => {
  try {
    const csvData = await bookService.getAllBooksForCSV();

    // CSV header'ını ayarla
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="books.csv"');

    // CSV formatında veriyi gönder
    res.status(200).send(csvData);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
