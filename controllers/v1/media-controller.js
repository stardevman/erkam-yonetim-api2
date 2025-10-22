const MediaService = require("../../services/v1/media-service");

class MediaController {
  /**
   * Upload image file
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        });
      }

      const result = await MediaService.uploadImage(req.file);

      res.status(201).json({
        success: true,
        message: "Image uploaded successfully",
        data: result,
      });
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({
        success: false,
        message: "Error uploading image",
        error: error.message,
      });
    }
  }

  /**
   * Upload document file
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async uploadDocument(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No document file provided",
        });
      }

      const result = await MediaService.uploadDocument(req.file);

      res.status(201).json({
        success: true,
        message: "Document uploaded successfully",
        data: result,
      });
    } catch (error) {
      console.error("Document upload error:", error);
      res.status(500).json({
        success: false,
        message: "Error uploading document",
        error: error.message,
      });
    }
  }

  /**
   * Upload any file with auto-detection
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file provided",
        });
      }

      const result = await MediaService.uploadFile(req.file);

      res.status(201).json({
        success: true,
        message: "File uploaded successfully",
        data: result,
      });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({
        success: false,
        message: "Error uploading file",
        error: error.message,
      });
    }
  }

  /**
   * Delete file
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async deleteFile(req, res) {
    try {
      const { url } = req.body;

      await MediaService.deleteFile(url);

      res.status(200).json({
        success: true,
        message: "File deleted successfully",
      });
    } catch (error) {
      console.error("File deletion error:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting file",
        error: error.message,
      });
    }
  }

  /**
   * Get file information
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getFileInfo(req, res) {
    try {
      const { url } = req.body;

      const fileInfo = MediaService.getFileInfo(url);

      res.status(200).json({
        success: true,
        message: "File info retrieved successfully",
        data: fileInfo,
      });
    } catch (error) {
      console.error("File info error:", error);
      res.status(500).json({
        success: false,
        message: "Error retrieving file info",
        error: error.message,
      });
    }
  }

  /**
   * List all media files with pagination
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async listMediaFiles(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        type = "all",
        sortBy = "uploadedAt",
        sortOrder = "desc",
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        type,
        sortBy,
        sortOrder,
      };

      const result = await MediaService.listMediaFiles(options);

      res.status(200).json({
        success: true,
        message: "Media files retrieved successfully",
        data: result.files,
        pagination: result.pagination,
        filters: result.filters,
      });
    } catch (error) {
      console.error("List media files error:", error);
      res.status(500).json({
        success: false,
        message: "Error retrieving media files",
        error: error.message,
      });
    }
  }

  /**
   * Get media statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getMediaStats(req, res) {
    try {
      const stats = await MediaService.getMediaStats();

      res.status(200).json({
        success: true,
        message: "Media statistics retrieved successfully",
        data: stats,
      });
    } catch (error) {
      console.error("Media stats error:", error);
      res.status(500).json({
        success: false,
        message: "Error retrieving media statistics",
        error: error.message,
      });
    }
  }
}

module.exports = MediaController;
