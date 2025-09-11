const categoryService = require("../../services/v1/category-service");

exports.getCategories = async (req, res) => {
  try {
    const { limit } = req.query;
    const categoriesData = await categoryService.getCategories(limit);
    res.status(200).json({
      success: true,
      count: categoriesData.length,
      data: categoriesData,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryService.getCategoryById(id);
    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (err) {
    if (err.message === "Category not found") {
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

exports.createCategory = async (req, res) => {
  try {
    const categoryData = req.body;
    const newCategory = await categoryService.createCategory(categoryData);
    res.status(201).json({
      success: true,
      data: newCategory,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedCategory = await categoryService.updateCategory(id, updateData);
    res.status(200).json({
      success: true,
      data: updatedCategory,
    });
  } catch (err) {
    if (err.message === "Category not found") {
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

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await categoryService.deleteCategory(id);
    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (err) {
    if (err.message === "Category not found") {
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

exports.reorderCategories = async (req, res) => {
  try {
    const { categories } = req.body;
    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid categories data",
      });
    }

    const reorderCategories = await categoryService.reorderCategories(categories);
    res.status(200).json({
      success: true,
      data: reorderCategories,
    });
  } catch (err) {
    console.error("Error reordering categories:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.updateCategoryParent = async (req, res) => {
  try {
    const { id } = req.params;
    const { parentId } = req.body;

    const updatedCategories = await categoryService.updateCategoryParent(id, parentId);
    res.status(200).json({
      success: true,
      data: updatedCategories,
    });
  } catch (err) {
    console.error("Error updating category parent:", err);
    if (err.message === "Category not found") {
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
