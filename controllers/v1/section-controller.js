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

exports.createHomeSection = async (req, res) => {
  try {
    const sectionData = req.body;
    const newSection = await sectionService.createHomeSection(sectionData);
    res.status(201).json({
      success: true,
      data: newSection,
    });
  } catch (err) {
    console.error("Error creating home section:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.deleteHomeSection = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Section ID is required for deletion",
      });
    }

    const deletedSection = await sectionService.deleteHomeSection(id);
    //TODO: 404 hatasını verilecek
    // if (!deletedSection) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "Section not found",
    //   });
    // }

    res.status(200).json({
      success: true,
      message: "Section deleted successfully",
      data: deletedSection,
    });
  } catch (err) {
    console.error("Error deleting home section:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
