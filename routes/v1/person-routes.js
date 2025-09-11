const express = require("express");
const {
  getPersons,
  getPersonById,
  createPerson,
  updatePerson,
  deletePerson,
} = require("../../controllers/v1/person-controller");

const router = express.Router();

// GET /v1/persons - Tüm kişileri getir
// POST /v1/persons - Yeni kişi oluştur
router.route("/").get(getPersons).post(createPerson);

// GET /v1/persons/:id - Belirli bir kişiyi getir
// PUT /v1/persons/:id - Belirli bir kişiyi güncelle
// DELETE /v1/persons/:id - Belirli bir kişiyi sil
router.route("/:id").get(getPersonById).put(updatePerson).delete(deletePerson);

module.exports = router;
