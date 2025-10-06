const bannerService = require("../../services/v1/banner-service.js");

exports.getBanners = async (req, res) => {
  try {
    const bannerItems = await bannerService.getBanners();
    res.status(200).json({
      success: true,
      data: bannerItems,
    });
  } catch (err) {
    console.error("Error fetching banner items:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.createBanner = async (req, res) => {
  try {
    const bannerData = req.body;
    const newBanner = await bannerService.createBanner(bannerData);
    res.status(201).json({
      success: true,
      data: newBanner,
    });
  } catch (err) {
    console.error("Error creating banner:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedBanner = await bannerService.updateBanner(id, updateData);
    if (!updatedBanner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }
    res.status(200).json({
      success: true,
      data: updatedBanner,
    });
  } catch (err) {
    console.error("Error fetching banner items:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Banner ID is required for deletion",
      });
    }

    const deletedBanner = await bannerService.deleteBanner(id);
    if (!deletedBanner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.status(200).json({
      success: true,
      data: deletedBanner,
    });
  } catch (err) {
    console.error("Error deleting banner:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};