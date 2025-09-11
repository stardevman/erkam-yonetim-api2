const express = require("express");
const {
  requestVerificationCode,
  confirmVerificationCode,
} = require("../../controllers/v1/auth-controller.js");

const router = express.Router();

// POST /v1/auth/code/request - Kullanıcı doğrulama kodu talep et
router.route("/code/request").post(requestVerificationCode);

// POST /v1/auth/code/confirm - Kullanıcı doğrulama kodunu onayla
router.route("/code/confirm").post(confirmVerificationCode);

module.exports = router;
