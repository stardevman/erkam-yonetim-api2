const authService = require("../../services/v1/auth-service.js");

exports.requestVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    await authService.sendVerificationCode(email);
    res.status(200).json({
      success: true,
      message: "Verification code sent successfully",
    });
  } catch (err) {
    console.error("Error requesting verification code:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.confirmVerificationCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const isValid = await authService.confirmVerificationCode(email, code);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Geçersiz doğrulama kodu",
      });
    }
    res.status(200).json({
      success: true,
      message: "Doğrulama kodu başarıyla onaylandı",
    });
  } catch (err) {
    console.error("Error confirming verification code:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
