const { bucket } = require("../config/firebase-admin");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

class FileUploadService {
  /**
   * Upload file to Firebase Storage
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} fileName - Original file name
   * @param {string} folder - Folder name (books, images, etc.)
   * @returns {Promise<string>} - Public URL of uploaded file
   */
  static async uploadFile(fileBuffer, fileName, folder = "books") {
    try {
      // Generate unique filename
      const extension = path.extname(fileName);
      const uniqueFileName = `${uuidv4()}${extension}`;
      const filePath = `${folder}/${uniqueFileName}`;

      // Create file reference
      const file = bucket.file(filePath);

      // Upload file
      await file.save(fileBuffer, {
        metadata: {
          contentType: this.getContentType(extension),
          metadata: {
            originalName: Buffer.from(fileName, 'latin1').toString('utf8'),
            uploadedAt: new Date().toISOString(),
          },
        },
      });

      // Make file publicly accessible
      await file.makePublic();

      // Return public URL
      return `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    } catch (error) {
      console.error("File upload error:", error);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  /**
   * Delete file from Firebase Storage
   * @param {string} fileUrl - Public URL of the file
   * @returns {Promise<boolean>} - Success status
   */
  static async deleteFile(fileUrl) {
    try {
      // Extract file path from URL
      const urlParts = fileUrl.split("/");
      const bucketName = urlParts[3];
      const filePath = urlParts.slice(4).join("/");

      if (bucketName !== bucket.name) {
        throw new Error("File does not belong to this storage bucket");
      }

      const file = bucket.file(filePath);
      await file.delete();
      return true;
    } catch (error) {
      console.error("File deletion error:", error);
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  /**
   * Get content type based on file extension
   * @param {string} extension - File extension
   * @returns {string} - MIME type
   */
  static getContentType(extension) {
    const contentTypes = {
      ".pdf": "application/pdf",
      ".epub": "application/epub+zip",
      ".mobi": "application/x-mobipocket-ebook",
      ".txt": "text/plain",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
    };

    return contentTypes[extension.toLowerCase()] || "application/octet-stream";
  }

  /**
   * Validate file type and size
   * @param {Object} file - Multer file object
   * @param {string} type - 'image' or 'document'
   * @returns {Object} - Validation result
   */
  static validateFile(file, type = "document") {
    const maxSizes = {
      image: 5 * 1024 * 1024, // 5MB for images
      document: 20 * 1024 * 1024, // 20MB for documents
    };

    const allowedTypes = {
      image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      document: [
        "application/pdf",
        "application/epub+zip",
        "application/x-mobipocket-ebook",
        "text/plain",
        "application/octet-stream"
      ],
    };

    // Check file size
    if (file.size > maxSizes[type]) {
      return {
        isValid: false,
        error: `File size too large. Maximum allowed: ${
          maxSizes[type] / (1024 * 1024)
        }MB`,
      };
    }

    // Check file type
    if (!allowedTypes[type].includes(file.mimetype)) {
      return {
        isValid: false,
        error: `Invalid file type. Allowed types: ${allowedTypes[type].join(", ")}`,
      };
    }

    return { isValid: true };
  }
}

module.exports = FileUploadService;
