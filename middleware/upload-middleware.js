const multer = require("multer");
const FileUploadService = require("../services/file-upload-service");

// Multer config - memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max
  },
  fileFilter: (req, file, cb) => {
    // File type validation will be done in the service
    cb(null, true);
  },
});

// Middleware for book creation (image + document)
const uploadBookFiles = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "document", maxCount: 1 },
]);

// Middleware for single image upload
const uploadSingleImage = upload.single("image");

// Middleware for single document upload
const uploadSingleDocument = upload.single("document");

// Middleware for any file upload (generic)
const uploadAnyFile = upload.single("file");

module.exports = {
  uploadBookFiles,
  uploadSingleImage,
  uploadSingleDocument,
  uploadAnyFile,
};
