var nodemailer = require('nodemailer');

// Mail transporter konfigürasyonu
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Mail gönderme fonksiyonu
const sendMail = async (to, subject, text, html) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: "Erkam Yayınları <" + process.env.EMAIL_FROM + ">",
      to,
      subject,
      text,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Mail gönderme hatası:', error);
    throw error;
  }
};

module.exports = {
  sendMail,
};
