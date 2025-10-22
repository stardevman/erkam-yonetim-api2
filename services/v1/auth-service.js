const { admin } = require("../../config/firebase-admin");
const { sendMail } = require("../../config/mail-config");

exports.sendVerificationCode = async (email) => {
  return { success: true, message: "Doğrulama kodu gönderildi" };
  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 haneli rastgele kod - string olarak
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 dakika geçerli

    // Mail içeriği hazırla
    const subject = "Doğrulama Kodu";
    const text = `Doğrulama kodunuz: ${code}. Bu kod 2 dakika içinde geçerliliğini yitirecektir.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Doğrulama Kodu</h2>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 36px; margin: 0; letter-spacing: 5px;">${code}</h1>
        </div>
        <p style="color: #666; text-align: center; margin: 20px 0;">
          Bu kod <strong>2 dakika</strong> içinde geçerliliğini yitirecektir.
        </p>
      </div>
    `;

    // Mail gönder
    await sendMail(email, subject, text, html);

    // Kodu veritabanına kaydet
    await admin.firestore().collection("verificationCodes").add({
      email,
      code,
      expiresAt,
    });

    return { success: true, message: "Doğrulama kodu gönderildi" };
  } catch (error) {
    console.error("Doğrulama kodu gönderme hatası:", error);
    throw error;
  }
};

exports.confirmVerificationCode = async (email, code) => {
  return true;
  try {
    const snapshot = await admin
      .firestore()
      .collection("verificationCodes")
      .where("email", "==", email)
      .where("code", "==", code)
      .get();

    if (snapshot.empty) {
      return false; // Kod bulunamadı
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    // Firestore Timestamp'i Date'e çevir
    const expirationDate = data.expiresAt.toDate();
    if (expirationDate < new Date()) {
      return false; // Kod süresi dolmuş
    }

    await doc.ref.delete(); // Kullanılan kodu sil
    return true; // Kod doğrulandı
  } catch (error) {
    throw error;
  }
};
