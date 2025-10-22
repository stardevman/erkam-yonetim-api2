const FileUploadService = require("../file-upload-service");

class MediaService {
  /**
   * Upload image file
   * @param {Object} file - Multer file object
   * @returns {Promise<Object>} - Upload result
   */
  static async uploadImage(file) {
    try {
      // Dosya validasyonu
      const validation = FileUploadService.validateFile(file, "image");
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Firebase Storage'a yükle
      const imageUrl = await FileUploadService.uploadFile(
        file.buffer,
        file.originalname,
        "images"
      );

      return {
        url: imageUrl,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        type: "image",
      };
    } catch (error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  /**
   * Upload document file
   * @param {Object} file - Multer file object
   * @returns {Promise<Object>} - Upload result
   */
  static async uploadDocument(file) {
    try {
      // Dosya validasyonu
      const validation = FileUploadService.validateFile(file, "document");
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Firebase Storage'a yükle
      const documentUrl = await FileUploadService.uploadFile(
        file.buffer,
        file.originalname,
        "documents"
      );

      return {
        url: documentUrl,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        type: "document",
      };
    } catch (error) {
      throw new Error(`Document upload failed: ${error.message}`);
    }
  }

  /**
   * Delete file from storage
   * @param {string} url - File URL
   * @returns {Promise<boolean>} - Success status
   */
  static async deleteFile(url) {
    try {
      if (!url) {
        throw new Error("File URL is required");
      }

      await FileUploadService.deleteFile(url);
      return true;
    } catch (error) {
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  /**
   * Get file information from URL
   * @param {string} url - File URL
   * @returns {Object} - File information
   */
  static getFileInfo(url) {
    try {
      if (!url) {
        throw new Error("File URL is required");
      }

      // URL'den dosya bilgilerini çıkar
      const urlParts = url.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const folder = urlParts[urlParts.length - 2];

      // Dosya tipini klasör adından belirle
      let fileType = "unknown";
      if (folder === "images") fileType = "image";
      else if (folder === "documents") fileType = "document";

      return {
        url: url,
        fileName: fileName,
        folder: folder,
        type: fileType,
        publicUrl: url,
      };
    } catch (error) {
      throw new Error(`Failed to get file info: ${error.message}`);
    }
  }

  /**
   * Upload any type of file with auto-detection
   * @param {Object} file - Multer file object
   * @returns {Promise<Object>} - Upload result
   */
  static async uploadFile(file) {
    try {
      // Dosya tipini MIME type'dan belirle
      const isImage = file.mimetype.startsWith("image/");

      if (isImage) {
        return await this.uploadImage(file);
      } else {
        return await this.uploadDocument(file);
      }
    } catch (error) {
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  /**
   * List all media files with pagination
   * @param {Object} options - Pagination and filter options
   * @returns {Promise<Object>} - Paginated media files
   */
  static async listMediaFiles(options = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        type = "all", // 'all', 'images', 'documents'
        sortBy = "uploadedAt",
        sortOrder = "desc",
      } = options;

      const { bucket } = require("../../config/firebase-admin");

      let prefix = "";
      if (type === "images") prefix = "images/";
      else if (type === "documents") prefix = "documents/";

      // Firebase Storage'dan dosyaları getir
      const [files] = await bucket.getFiles({
        prefix: prefix,
        maxResults: Math.max(limit * page + 100, 200), // En az 200, genelde limit*page+100
      });

      // Dosya bilgilerini işle
      const mediaFiles = await Promise.all(
        files.map(async (file) => {
          try {
            const [metadata] = await file.getMetadata();
            const folder = file.name.split("/")[0];
            const fileName = file.name.split("/")[1];

            // Skip if no filename (folder itself)
            if (!fileName) return null;

            return {
              id: file.name.replace(/[\/\.]/g, "_"), // Benzersiz ID oluştur
              fileName: fileName,
              originalName: metadata.metadata?.originalName || fileName,
              url: `https://storage.googleapis.com/${bucket.name}/${file.name}`,
              type: folder === "images" ? "image" : "document",
              folder: folder,
              size: parseInt(metadata.size),
              mimetype: metadata.contentType,
              uploadedAt: metadata.timeCreated,
              updatedAt: metadata.updated,
            };
          } catch (error) {
            console.error("Error processing file:", file.name, error);
            return null;
          }
        })
      );

      // Null değerleri filtrele
      const validFiles = mediaFiles.filter((file) => file !== null);

      // Sıralama
      validFiles.sort((a, b) => {
        if (sortBy === "uploadedAt") {
          const dateA = new Date(a.uploadedAt);
          const dateB = new Date(b.uploadedAt);
          return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
        } else if (sortBy === "size") {
          return sortOrder === "desc" ? b.size - a.size : a.size - b.size;
        } else if (sortBy === "name") {
          return sortOrder === "desc"
            ? b.originalName.localeCompare(a.originalName)
            : a.originalName.localeCompare(b.originalName);
        }
        return 0;
      });

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedFiles = validFiles.slice(startIndex, endIndex);

      // Pagination bilgileri
      const totalFiles = validFiles.length;
      const totalPages = Math.ceil(totalFiles / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        files: paginatedFiles,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalFiles: totalFiles,
          limit: limit,
          hasNextPage: hasNextPage,
          hasPrevPage: hasPrevPage,
        },
        filters: {
          type: type,
          sortBy: sortBy,
          sortOrder: sortOrder,
        },
      };
    } catch (error) {
      throw new Error(`Failed to list media files: ${error.message}`);
    }
  }

  /**
   * Get media statistics
   * @returns {Promise<Object>} - Media statistics
   */
  static async getMediaStats() {
    try {
      const { bucket } = require("../../config/firebase-admin");

      // Resimler
      const [imageFiles] = await bucket.getFiles({ prefix: "images/" });
      const [documentFiles] = await bucket.getFiles({ prefix: "documents/" });

      let totalImageSize = 0;
      let totalDocumentSize = 0;

      // Resim boyutları
      for (const file of imageFiles) {
        if (file.name !== "images/") {
          // Klasörün kendisini sayma
          try {
            const [metadata] = await file.getMetadata();
            totalImageSize += parseInt(metadata.size);
          } catch (error) {
            console.error("Error getting image metadata:", error);
          }
        }
      }

      // Döküman boyutları
      for (const file of documentFiles) {
        if (file.name !== "documents/") {
          // Klasörün kendisini sayma
          try {
            const [metadata] = await file.getMetadata();
            totalDocumentSize += parseInt(metadata.size);
          } catch (error) {
            console.error("Error getting document metadata:", error);
          }
        }
      }

      return {
        images: {
          count: imageFiles.filter((f) => f.name !== "images/").length,
          totalSize: totalImageSize,
          totalSizeMB: (totalImageSize / (1024 * 1024)).toFixed(2),
        },
        documents: {
          count: documentFiles.filter((f) => f.name !== "documents/").length,
          totalSize: totalDocumentSize,
          totalSizeMB: (totalDocumentSize / (1024 * 1024)).toFixed(2),
        },
        total: {
          count:
            imageFiles.filter((f) => f.name !== "images/").length +
            documentFiles.filter((f) => f.name !== "documents/").length,
          totalSize: totalImageSize + totalDocumentSize,
          totalSizeMB: (
            (totalImageSize + totalDocumentSize) /
            (1024 * 1024)
          ).toFixed(2),
        },
      };
    } catch (error) {
      throw new Error(`Failed to get media stats: ${error.message}`);
    }
  }

  /**
   * Get media file by ID
   * @param {string} id - Media file ID
   * @returns {Promise<Object>} - Media file information
   */
  static async getMediaById(id) {
    try {
      if (!id) {
        throw new Error("Media ID is required");
      }

      // ID'yi dosya yoluna çevir (ID formatı: images_uuid_jpg)
      const filePath = id.replace(/_/g, "/").replace(/\/([^/]+)$/, ".$1");

      const { bucket } = require("../../config/firebase-admin");
      const file = bucket.file(filePath);

      // Dosyanın var olup olmadığını kontrol et
      const [exists] = await file.exists();
      if (!exists) {
        throw new Error("Media file not found");
      }

      // Dosya metadata'sını al
      const [metadata] = await file.getMetadata();
      const folder = filePath.split("/")[0];
      const fileName = filePath.split("/")[1];

      return {
        id: id,
        fileName: fileName,
        originalName: metadata.metadata?.originalName || fileName,
        url: `https://storage.googleapis.com/${bucket.name}/${filePath}`,
        type: folder === "images" ? "image" : "document",
        folder: folder,
        size: parseInt(metadata.size),
        mimetype: metadata.contentType,
        uploadedAt: metadata.timeCreated,
        updatedAt: metadata.updated,
      };
    } catch (error) {
      throw new Error(`Failed to get media by ID: ${error.message}`);
    }
  }

  /**
   * Get multiple media files by IDs
   * @param {string[]} ids - Array of media file IDs
   * @returns {Promise<Object[]>} - Array of media file information
   */
  static async getMediaByIds(ids) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new Error("Media IDs array is required");
      }

      const mediaFiles = await Promise.all(
        ids.map(async (id) => {
          try {
            return await this.getMediaById(id);
          } catch (error) {
            console.error(`Error getting media with ID ${id}:`, error.message);
            return null;
          }
        })
      );

      // Null değerleri filtrele
      return mediaFiles.filter((file) => file !== null);
    } catch (error) {
      throw new Error(`Failed to get media by IDs: ${error.message}`);
    }
  }
}

module.exports = MediaService;
