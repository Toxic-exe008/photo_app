const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const photoRoutes = require("./routes/photoRoutes");

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "*"
}));

app.use(express.json());

app.use("/api/photos", photoRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  });
