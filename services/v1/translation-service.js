const Translation = require("../../models/Translation");
const Book = require("../../models/Book");

exports.getTranslationsById = async (id) => {
  try {
    const translation = await Translation.findById(id);

    if (!translation) {
      return null;
    }

    // Translation dokümanındaki tüm ISBN'leri çıkar
    const isbns = translation.books.map((book) => book.isbn);

    // Books koleksiyonundan ISBN'lere göre kitapları bul ve projeksiyonla döndür
    const books = await Book.find(
      { isbn: { $in: isbns } },
      {
        _id: 1,
        isbn: 1,
        title: 1,
        image: 1,
        language: 1,
      }
    );

    // Translation dokümanına books bilgilerini ekle
    const result = {
      _id: translation._id,
      books: books,
    };

    return result;
  } catch (error) {
    console.error("Error in getTranslationsByIsbn:", error);
    throw error;
  }
};

exports.addBookToTranslation = async (isbn, translationId) => {
  try {
    const targetTranslation = await Translation.findById(translationId);

    if (!targetTranslation) {
      throw new Error("Translation not found");
    }

    const bookData = await Book.findOne(
      { isbn },
      {
        _id: 1,
        isbn: 1,
        language: 1,
        relatedBook: 1,
      }
    );

    if (!bookData) {
      throw new Error("Book not found");
    }

    // Kitabı çeviri grubuna eklemeden önce, zaten ekli olup olmadığını kontrol et
    const alreadyExists = targetTranslation.books.some((book) => book.isbn === isbn);

    if (alreadyExists) {
      return targetTranslation; // Kitap zaten ekliyse, mevcut çeviri döndür
    }

    if (bookData.relatedBook) {
      throw new Error("Book is already part of another translation group");
    }

    // İlgili kitabın relatedBook alanını güncelle
    await Book.updateOne(
      { isbn },
      { $set: { relatedBook: bookData._id, translationsId: targetTranslation._id } }
    );

    targetTranslation.books.push(bookData);

    // Orijinal çeviri grubundan kitabı kaldır
    const originalTranslation = await Translation.findOneAndUpdate(
      {
        "books.isbn": isbn,
      },
      { $pull: { books: { isbn: isbn } } }
    );

    // Eğer orijinal çeviri grubunda başka kitap kalmadıysa, o grubu sil
    if (originalTranslation && originalTranslation.books.length === 1) {
      await Translation.deleteOne({ _id: originalTranslation._id });
    }

    await targetTranslation.save();
    return targetTranslation;
  } catch (error) {
    throw error;
  }
};

exports.removeBookFromTranslation = async (isbn, translationId) => {
  try {
    const translation = await Translation.findById(translationId);
    if (!translation) {
      throw new Error("Translation not found");
    }

    // İlgili kitabın relatedBook ve translationsId alanlarını null yap
    await Book.updateOne(
      { isbn },
      { $set: { relatedBook: null, translationsId: null } }
    );

    const bookIndex = translation.books.findIndex((book) => book.isbn === isbn);
    if (bookIndex === -1) {
      throw new Error("Book not found in the specified translation");
    }

    // Kitabı çeviri grubundan kaldır
    translation.books.splice(bookIndex, 1);

    // Kitabın relatedBook alanını null yap
    //await Book.updateOne({ isbn }, { $set: { relatedBook: null } });

    // Eğer çeviri grubunda başka kitap kalmadıysa, o grubu sil
    if (translation.books.length === 0) {
      await Translation.deleteOne({ _id: translationId });
      return null;
    } else {
      await translation.save();
    }

    // Kitap için yeni bir çeviri grubu oluşturulabilir (isteğe bağlı)
    const bookData = await Book.findOne(
      { isbn },
      { _id: 1, isbn: 1, title: 1, image: 1, language: 1 }
    );

    if (!bookData) {
      throw new Error("Book not found");
    }

    const newTranslation = new Translation({
      books: [bookData],
    });
    await newTranslation.save();

    // Kitabın translationsId alanını yeni çeviri grubunun ID'si ile güncelle
    await Book.updateOne({ isbn }, { $set: { translationsId: newTranslation._id } });
    //
  } catch (error) {
    throw error;
  }
};
