require("dotenv").config();

const express = require("express");
const { connectMongo } = require("./config/db-connect");
const app = express();

const cors = require("cors");

const port = process.env.PORT || 3000;

//const apiKeyMiddleware = require("./middleware/v1/validation-middleware");

app.use(cors());
app.use(express.json());
//app.use(apiKeyMiddleware);

app.use("/v1/auth", require("./routes/v1/auth-routes"));
app.use("/v1/users", require("./routes/v1/user-routes"));
app.use("/v1/books", require("./routes/v1/book-routes"));
app.use("/v1/translations", require("./routes/v1/translation-routes"));
app.use("/v1/persons", require("./routes/v1/person-routes"));
app.use("/v1/categories", require("./routes/v1/category-routes"));
app.use("/v1/sections", require("./routes/v1/section-routes"));
app.use("/v1/banners", require("./routes/v1/banner-routes"));
app.use("/v1/media", require("./routes/v1/media-routes"));

// MongoDB bağlantısını başlat ve sunucuyu çalıştır
const startServer = async () => {
  try {
    await connectMongo();
    app.listen(port, "0.0.0.0", () => {
      console.log(`App listening on port ${port}!`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
