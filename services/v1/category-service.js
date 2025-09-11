const Category = require("../../models/Category");
const Book = require("../../models/Book");
const Stats = require("../../models/Stats");

exports.getCategories = async () => {
  try {
    return Category.find().sort({ order: 1 });
  } catch (error) {
    throw error;
  }
};

exports.createCategory = async (categoryData) => {
  try {
    const newCategory = new Category(categoryData);
    const savedCategory = await newCategory.save();

    // Increment category count in stats
    await Stats.incrementCount("categories");

    return savedCategory;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

exports.getCategoryById = async (id) => {
  try {
    const category = await Category.findById(id);
    if (!category) {
      throw new Error("Category not found");
    }
    return category;
  } catch (error) {
    throw error;
  }
};

exports.updateCategory = async (id, updateData) => {
  try {
    const category = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      throw new Error("Category not found");
    }
    return category;
  } catch (error) {
    throw error;
  }
};

exports.deleteCategory = async (id) => {
  try {
    const books = await Book.find({ category: id });
    if (books.length > 0) {
      throw new Error("Kitaplar bu kategoriye bağlı olduğu için silinemiyor");
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      throw new Error("Category not found");
    }

    await Category.deleteMany({ parent: id }); // Silinen kategorinin alt kategorilerini de sil

    // Decrement category count in stats
    await Stats.decrementCount("categories");

    return category;
  } catch (error) {
    throw error;
  }
};

exports.reorderCategories = async (orderedCategories, parentId = null) => {
  try {
    const updatePromises = orderedCategories.map(async (category, index) => {
      // Kategorinin order ve parent bilgisini güncelle
      await Category.findByIdAndUpdate(
        category.id,
        { order: category.order ?? index, parent: parentId },
        { new: true, runValidators: true }
      );
      // Eğer children varsa, onları da recursive olarak güncelle
      if (category.children && category.children.length > 0) {
        await exports.reorderCategories(category.children, category.id);
      }
    });

    await Promise.all(updatePromises);

    return Category.find().sort({ order: 1 });
  } catch (error) {
    console.error("Error reordering categories:", error);
    throw error;
  }
};

exports.updateCategoryParent = async (id, parentId) => {
  try {
    const category = await Category.findByIdAndUpdate(
      id,
      { parent: parentId },
      { new: true, runValidators: true }
    );
    if (!category) {
      throw new Error("Category not found");
    }
    return Category.find().sort({ order: 1 });
  } catch (error) {
    throw error;
  }
};
