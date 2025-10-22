const translationService = require("../../services/v1/translation-service");

exports.getTranslationsById = async (req, res) => {
  try {
    const { id } = req.query;
    const translation = await translationService.getTranslationsById(id);

    if (!translation) {
      return res
        .status(404)
        .json({ message: "Translation not found for the given ID" });
    }

    res.status(200).json(translation);
  } catch (error) {
    console.error("Error fetching translations by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.addBookToTranslation = async (req, res) => {
  try {
    const { isbn, translationId } = req.body;

    if (!isbn || !translationId) {
      return res.status(400).json({
        message: "Both isbn and translationId are required in the request body",
      });
    }

    const updatedTranslation = await translationService.addBookToTranslation(
      isbn,
      translationId 
    );

    res.status(200).json(updatedTranslation);
  } catch (error) {
    console.error("Error adding book to translation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.removeBookFromTranslation = async (req, res) => {
  try {
    const { id: translationId } = req.params;
    const { isbn } = req.body;

    if (!isbn || !translationId) {
      return res.status(400).json({
        message: "Both isbn and translationId are required in the request body",
      });
    }

    const updatedTranslation = await translationService.removeBookFromTranslation(
      isbn,
      translationId
    );

    res.status(200).json(updatedTranslation);
  } catch (error) {
    console.error("Error removing book from translation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
