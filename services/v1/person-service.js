const Person = require("../../models/Person");
const Book = require("../../models/Book");
const Stats = require("../../models/Stats");

exports.getPersons = async () => {
  try {
    return Person.find().populate("createdBy").sort({ createdAt: -1 });
  } catch (error) {
    throw error;
  }
};

exports.createPerson = async (personData) => {
  try {
    const newPerson = new Person(personData);
    const savedPerson = await newPerson.save();

    if (personData.role === "author") {
      await Stats.incrementCount("authors");
    } else if (personData.role === "translator") {
      await Stats.incrementCount("translators");
    } else if (personData.role === "editor") {
      await Stats.incrementCount("editors");
    }

    return savedPerson;
  } catch (error) {
    console.error("Error creating person:", error);
    throw error;
  }
};

exports.getPersonById = async (id) => {
  try {
    const person = await Person.findById(id);
    if (!person) {
      throw new Error("Person not found");
    }
    return person;
  } catch (error) {
    throw error;
  }
};

exports.updatePerson = async (id, updateData) => {
  try {
    const person = await Person.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!person) {
      throw new Error("Person not found");
    }
    return person;
  } catch (error) {
    throw error;
  }
};

exports.deletePerson = async (id) => {
  try {
    // Önce silinecek kişinin bilgilerini al
    const personToDelete = await Person.findById(id);
    if (!personToDelete) {
      throw new Error("Kişi bulunamadığı için silinemedi");
    }

    // Bu kişinin bağlı olduğu kitapları bul
    const books = await Book.find({ persons: { $in: [id] } });
    if (books.length > 0) {
      throw new Error(
        `${personToDelete.name} ${books.length} kitaba bağlı olduğu için silinemiyor.`
      );
    }

    // Kişiyi sil
    await Person.findByIdAndDelete(id);

    // İstatistikleri güncelle
    if (personToDelete.role === "author") {
      await Stats.decrementCount("authors");
    } else if (personToDelete.role === "translator") {
      await Stats.decrementCount("translators");
    } else if (personToDelete.role === "editor") {
      await Stats.decrementCount("editors");
    }
  } catch (error) {
    throw error;
  }
};
