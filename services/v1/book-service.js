const Book = require("../../models/Book");
const Translation = require("../../models/Translation");
const Stats = require("../../models/Stats");

exports.getBooks = async (params = {}) => {
  try {
    const { limit = 10, page = 1 } = params;

    // Sayfa ve limit değerlerini doğru formata dönüştür
    const limitNumber = parseInt(limit) || 10;
    const pageNumber = parseInt(page) || 1;
    const skip = (pageNumber - 1) * limitNumber;

    // Pipeline'ı adım adım oluştur
    const pipeline = [];

    // Translation bilgilerini lookup et
    pipeline.push({
      $lookup: {
        from: "translations",
        localField: "translationsId",
        foreignField: "_id",
        as: "translation",
      },
    });

    // Translation varsa unwind et
    pipeline.push({ $unwind: "$translation" });

    // Sadece isbns array'i 1 olanları filtrele yoksa language tr ise
    pipeline.push({
      $match: {
        $expr: {
          $cond: {
            if: { $eq: ["$language", "tr"] },
            then: true,
            else: { $eq: [{ $size: "$translation.books" }, 1] },
          },
        },
      },
    });

    // Translation books'daki isbn'leri ayrı kitaplar olarak lookup et
    pipeline.push({
      $lookup: {
        from: "books",
        let: { translationBooks: "$translation.books" },
        as: "translationBooks",
        pipeline: [
          {
            $match: {
              $expr: {
                $in: ["$isbn", "$$translationBooks.isbn"],
              },
            },
          },
          {
            $project: {
              _id: 1,
              isbn: 1,
              title: 1,
              image: 1,
              language: 1,
            },
          },
        ],
      },
    });

    // Person lookup
    pipeline.push({
      $lookup: {
        from: "persons",
        localField: "persons",
        foreignField: "_id",
        as: "persons",
      },
    });

    // Person fields
    pipeline.push({
      $addFields: {
        authors: {
          $filter: {
            input: "$persons",
            as: "person",
            cond: { $eq: ["$$person.role", "author"] },
          },
        },
        translators: {
          $filter: {
            input: "$persons",
            as: "person",
            cond: { $eq: ["$$person.role", "translator"] },
          },
        },
        illustrators: {
          $filter: {
            input: "$persons",
            as: "person",
            cond: { $eq: ["$$person.role", "illustrator"] },
          },
        },
      },
    });

    // Categories lookup
    pipeline.push({
      $lookup: {
        from: "categories",
        localField: "categories",
        foreignField: "_id",
        as: "categories",
      },
    });

    // RelatedBook lookup
    pipeline.push({
      $lookup: {
        from: "books",
        localField: "relatedBook",
        foreignField: "_id",
        as: "relatedBook",
        pipeline: [
          {
            $project: {
              _id: 1,
              title: 1,
              isbn: 1,
              person: 1,
            },
          },
        ],
      },
    });

    // Arrays'i unwind et
    // pipeline.push({ $unwind: { path: "$persons", preserveNullAndEmptyArrays: true } });
    pipeline.push({
      $unwind: { path: "$relatedBook", preserveNullAndEmptyArrays: true },
    });

    // Sıralama
    pipeline.push({ $sort: { createdAt: -1 } });

    pipeline.push({
      $project: {
        persons: 0, // Person bilgilerini gizle author, editor, translator gibi rolleri ayrı bir alanda tutuluyor
      },
    });

    // Facet ile pagination
    pipeline.push({
      $facet: {
        data: [{ $skip: skip }, { $limit: limitNumber }],
        count: [{ $count: "total" }],
      },
    });

    const results = await Book.aggregate(pipeline);
    const books = results[0]?.data || [];
    const total = (await Stats.getCount("books")) || 0;

    return {
      books,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(total / limitNumber),
      },
    };
  } catch (error) {
    console.error("Error fetching books:", error);
    throw error;
  }
};

exports.createBook = async (bookData) => {
  let translation;

  try {
    if (bookData.relatedBook) {
      const relatedBook = await Book.findById(bookData.relatedBook);

      if (!relatedBook || !relatedBook.translationsId) {
        throw new Error("Related book not found or has no translation group");
      }

      translation = await Translation.findByIdAndUpdate(
        relatedBook.translationsId,
        {
          $addToSet: { books: { isbn: bookData.isbn, language: bookData.language } },
        },
        { new: true, runValidators: true }
      );

      if (!translation) {
        throw new Error("Translation group not found");
      }
    } else {
      translation = new Translation({
        books: [
          {
            isbn: bookData.isbn,
            language: bookData.language,
          },
        ],
      });
      await translation.save();
    }

    const existingBook = await Book.findOne({ isbn: bookData.isbn });
    if (existingBook) {
      throw new Error("Bu ISBN'e sahip bir kitap zaten var");
    }

    const newBook = new Book({
      ...bookData,
      translationsId: translation._id,
    });

    // persons listesinden ilk yazarı leadAuthor olarak ata
    if (newBook.persons && newBook.persons.length > 0) {
      const Person = require("../../models/Person");
      const firstAuthor = await Person.findOne({
        _id: { $in: newBook.persons[0] },
        role: "author",
      });
      if (firstAuthor) {
        newBook.leadAuthor = firstAuthor.name;
      }
    }

    const savedBook = await newBook.save();

    // Increment book count in stats
    await Stats.incrementCount("books");

    return savedBook;
  } catch (error) {
    console.error("Error creating book:", error);
    throw error;
  }
};

exports.getBookByIsbn = async (isbn) => {
  try {
    const book = await Book.findOne({ isbn })
      .populate("persons")
      .populate("categories")
      .populate("relatedBook", { _id: 1, isbn: 1, title: 1, person: 1 });

    if (!book) {
      throw new Error("Book not found");
    }

    // Rollere göre ayır
    const authors = (book.persons || []).filter((p) => p.role === "author");
    const translators = (book.persons || []).filter((p) => p.role === "translator");
    const illustrators = (book.persons || []).filter(
      (p) => p.role === "illustrator"
    );

    // Dönüş nesnesine ekle
    const bookObj = book.toObject();
    bookObj.authors = authors;
    bookObj.translators = translators;
    bookObj.illustrators = illustrators;
    delete bookObj.persons;

    return bookObj;
  } catch (error) {
    console.error("Error fetching book by ISBN:", error);
    throw error;
  }
};

exports.updateBook = async (updateData) => {
  try {
    // Eğer relatedBook güncellenmişse, ilgili çeviri grubunu güncelle
    // if (updateData.relatedBook) {
    //   const relatedBook = await Book.findById(updateData.relatedBook);

    //   if (!relatedBook || !relatedBook.translationsId) {
    //     throw new Error("Related book not found or has no translation group");
    //   }

    //   // İlgili çeviri grubunu güncelle
    //   await Translation.findByIdAndUpdate(
    //     relatedBook.translationsId,
    //     {
    //       $addToSet: {
    //         books: { isbn: updateData.isbn, language: updateData.language },
    //       },
    //     },
    //     { new: true, runValidators: true }
    //   );

    //   // Güncellenen çeviri grubunun ID'sini ekle
    //   updateData.translationsId = relatedBook.translationsId;

    //   // Eğer çeviri grubunda sadece bu kitap varsa, onu sil
    //   const book = await Book.findOne({ isbn: updateData.isbn });
    //   const bookTranslation = await Translation.findById(book.translationsId);
    //   if (bookTranslation && bookTranslation.books.length === 1) {
    //     await Translation.findByIdAndDelete(book.translationsId);
    //   }
    // }

    // _id alanını updateData'dan çıkar (immutable field hatası önlenir)
    const { _id, ...updateDataWithoutId } = updateData;

    // persons listesinden ilk yazarı leadAuthor olarak ata
    if (updateDataWithoutId.persons && updateDataWithoutId.persons.length > 0) {
      const Person = require("../../models/Person");
      const firstAuthor = await Person.findOne({
        _id: { $in: updateDataWithoutId.persons[0] },
        role: "author",
      });
      if (firstAuthor) {
        updateDataWithoutId.leadAuthor = firstAuthor.name;
      }
    } else {
      updateDataWithoutId.leadAuthor = "";
    }

    return await Book.findOneAndUpdate(
      { isbn: updateDataWithoutId.isbn },
      updateDataWithoutId,
      {
        new: true,
        runValidators: true,
      }
    ).populate("persons").populate("categories");
  } catch (error) {
    throw error;
  }
};

exports.deleteBook = async (isbn) => {
  try {
    const book = await Book.findOneAndDelete({ isbn });
    if (!book) {
      throw new Error("Book not found");
    }

    // Eğer bu kitap bir çeviri grubuna aitse, çeviri grubundan ISBN'i kaldır
    if (book.translationsId) {
      const updatedTranslation = await Translation.findByIdAndUpdate(
        book.translationsId,
        { $pull: { books: { isbn: book.isbn } } },
        { new: true }
      );
      // Eğer books listesi hiç kalmadıysa dökümanı sil
      if (
        updatedTranslation &&
        (!updatedTranslation.books || updatedTranslation.books.length === 0)
      ) {
        await Translation.findByIdAndDelete(book.translationsId);
      }
    }

    // Decrement book count in stats
    await Stats.decrementCount("books");

    return book;
  } catch (error) {
    throw error;
  }
};

exports.searchBooks = async (searchParams = {}) => {
  try {
    const {
      query,
      //person,
      isbn,
      language,
      limit = 10,
      page = 1,
      sortField = "createdAt",
      sortOrder = "desc",
    } = searchParams;

    // Sayfa ve limit değerlerini doğru formata dönüştür
    const limitNumber = parseInt(limit) || 10;
    const pageNumber = parseInt(page) || 1;
    const skip = (pageNumber - 1) * limitNumber;

    // Atlas Search kullanarak arama pipeline'ı oluştur
    const pipeline = [];

    if (query || person || isbn || language) {
      let searchStage = {
        $search: {
          index: "default",
          compound: {
            must: [],
            should: [],
            filter: [],
          },
        },
      };

      // Metin araması için Atlas Search kullan
      if (query) {
        searchStage.$search.compound.must.push({
          text: {
            query: query,
            path: ["title", "description", "keywords"],
            fuzzy: {
              maxEdits: 2,
              prefixLength: 2,
              maxExpansions: 50,
            },
          },
        });
      }

      // Kişi filtresi
      // if (person) {
      //   searchStage.$search.compound.must.push({
      //     equals: {
      //       path: "person",
      //       value: mongoose.Types.ObjectId(person),
      //     },
      //   });
      // }

      // ISBN filtresi (tam eşleşme)
      if (isbn) {
        searchStage.$search.compound.must.push({
          text: {
            query: isbn,
            path: "isbn",
          },
        });
      }

      // Dil filtresi
      if (language) {
        searchStage.$search.compound.filter.push({
          text: {
            query: language,
            path: "language",
          },
        });
      }

      pipeline.push(searchStage);
    } else {
      // Hiç arama parametresi yoksa tüm kayıtları getir
      pipeline.push({ $match: {} });
    }

    // Populate için lookup stages
    pipeline.push(
      {
        $lookup: {
          from: "persons",
          localField: "persons",
          foreignField: "_id",
          as: "persons",
        },
      },
      // Person fields
      {
        $addFields: {
          authors: {
            $filter: {
              input: "$persons",
              as: "person",
              cond: { $eq: ["$$person.role", "author"] },
            },
          },
          translators: {
            $filter: {
              input: "$persons",
              as: "person",
              cond: { $eq: ["$$person.role", "translator"] },
            },
          },
          illustrators: {
            $filter: {
              input: "$persons",
              as: "person",
              cond: { $eq: ["$$person.role", "illustrator"] },
            },
          },
        },
      }
    );

    // Lookup for categories
    pipeline.push({
      $lookup: {
        from: "categories",
        localField: "categories",
        foreignField: "_id",
        as: "categories",
      },
    });

    pipeline.push({
      $lookup: {
        from: "books",
        localField: "relatedBook",
        foreignField: "_id",
        as: "relatedBook",
      },
    });

    // Unwind the arrays from lookup
    pipeline.push({
      $unwind: { path: "$relatedBook", preserveNullAndEmptyArrays: true },
    });

    // Search score'unu field olarak ekle (sadece search yapıldıysa)
    if (query || person || isbn || language) {
      pipeline.push({
        $addFields: {
          score: { $meta: "searchScore" },
        },
      });
    }

    // Sıralama stage'i
    const sortStage = {};
    if (query && (query || person || isbn || language)) {
      // Search yapıldıysa önce score'a göre sırala
      sortStage.score = -1;
      sortStage[sortField] = sortOrder === "asc" ? 1 : -1;
    } else {
      // Search yapılmadıysa sadece belirtilen field'a göre sırala
      sortStage[sortField] = sortOrder === "asc" ? 1 : -1;
    }

    pipeline.push({ $sort: sortStage });

    // Facet kullanarak sayfalama ve count işlemleri
    pipeline.push({
      $facet: {
        data: [{ $skip: skip }, { $limit: limitNumber }],
        count: [{ $count: "total" }],
      },
    });

    // Person bilgilerini gizle
    pipeline.push({
      $project: {
        persons: 0,
      },
    });

    // Atlas Search kullanarak sorguyu çalıştır
    const results = await Book.aggregate(pipeline);

    const books = results[0]?.data || [];
    const total = results[0]?.count[0]?.total || 0;

    // Sonuçları ve meta bilgileri döndür
    return {
      books,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        pages: Math.ceil(total / limitNumber),
      },
    };
  } catch (error) {
    console.error("Search books error:", error);
    throw error;
  }
};

exports.getAllBooksForCSV = async () => {
  try {
    // Tüm kitapları populate ederek getir
    const books = await Book.find({ isVisible: true })
      .sort({ createdAt: -1 })
      .populate("persons", "name role")
      .populate("categories", "name")
      .lean();

    // CSV header
    const csvHeader =
      "ISBN,Başlık,Yazarlar,Çevirmenler,İllüstratörler,Kategoriler,Sayfalar,Dil,Açıklama,Olusturan,OlusturmaTarihi\n";

    // CSV rows
    const csvRows = books
      .map((book) => {
        // CSV formatında özel karakterleri escape et
        const escapeCSV = (field) => {
          if (!field) return "";
          const stringField = String(field);
          // Eğer virgül, çift tırnak veya yeni satır varsa çift tırnak içine al
          if (
            stringField.includes(",") ||
            stringField.includes('"') ||
            stringField.includes("\n")
          ) {
            return `"${stringField.replace(/"/g, '""')}"`;
          }
          return stringField;
        };

        return [
          escapeCSV(book.isbn),
          escapeCSV(book.title),
          escapeCSV(
            book.persons
              .filter((p) => p.role === "author")
              .map((p) => p.name)
              .join(", ")
          ),
          escapeCSV(
            book.persons
              .filter((p) => p.role === "translator")
              .map((p) => p.name)
              .join(", ")
          ),
          escapeCSV(
            book.persons
              .filter((p) => p.role === "illustrator")
              .map((p) => p.name)
              .join(", ")
          ),
          escapeCSV(book.categories.map((c) => c.name).join(", ")),
          escapeCSV(book.pages),
          escapeCSV(book.language || ""),
          escapeCSV(book.description || ""),
          escapeCSV(book.createdBy),
          escapeCSV(
            book.createdAt
              ? new Date(book.createdAt).toISOString().split("T")[0]
              : ""
          ),
        ].join(",");
      })
      .join("\n");

    return csvHeader + csvRows;
  } catch (error) {
    console.error("Get all books for CSV error:", error);
    throw error;
  }
};
