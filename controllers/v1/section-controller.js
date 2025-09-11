const sectionService = require("../../services/v1/section-service.js");

exports.getHomeSections = async (req, res) => {
  try {
    const sections = await sectionService.getHomeSections();
    res.status(200).json({
      success: true,
      data: sections,
    });
  } catch (err) {
    console.error("Error getting home sections:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.updateHomeSections = async (req, res) => {
  try {
    const updateData = req.body;
    const updatedSections = await sectionService.updateHomeSections(updateData);
    res.status(200).json({
      success: true,
      data: updatedSections,
    });
  } catch (err) {
    console.error("Error updating home sections:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};