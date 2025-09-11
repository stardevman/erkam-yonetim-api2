const personService = require("../../services/v1/person-service");

exports.getPersons = async (req, res) => {
  try {
    const { limit } = req.query;
    const personsData = await personService.getPersons(limit);
    res.status(200).json({
      success: true,
      count: personsData.length,
      data: personsData,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.getPersonById = async (req, res) => {
  try {
    const { id } = req.params;
    const person = await personService.getPersonById(id);
    res.status(200).json({
      success: true,
      data: person,
    });
  } catch (err) {
    if (err.message === "Person not found") {
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

exports.createPerson = async (req, res) => {
  try {
    const personData = req.body;
    const newPerson = await personService.createPerson(personData);
    res.status(201).json({
      success: true,
      data: newPerson,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

exports.updatePerson = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedPerson = await personService.updatePerson(id, updateData);
    res.status(200).json({
      success: true,
      data: updatedPerson,
    });
  } catch (err) {
    if (err.message === "Person not found") {
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

exports.deletePerson = async (req, res) => {
  try {
    const { id } = req.params;
    await personService.deletePerson(id);
    res.status(200).json({
      success: true,
      message: "Person deleted successfully",
    });
  } catch (err) {
    console.log("Error deleting person:", err);
    if (err.message === "Kişi bulunamadığı için silinemedi") {
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
