const express = require("express");
const {
  getUserById,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../../controllers/v1/user-controller");

const router = express.Router();

// GET /v1/users/:uid - Belirli bir kullanıcıyı getir
router.route("/:uid").get(getUserById);

// GET /v1/users kullanıcıları getir
// POST /v1/users yeni kullanıcı oluştur
router.route("/").get(getUsers).post(createUser);

// PUT /v1/users/:uid kullanıcı güncelle
// DELETE /v1/users/:uid kullanıcı sil
router.route("/:uid").put(updateUser).delete(deleteUser);

module.exports = router;
