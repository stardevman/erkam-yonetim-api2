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
