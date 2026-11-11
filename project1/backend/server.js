const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const photoRoutes = require("./routes/photoRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        const netlifyPreview = /^https:\/\/[a-z0-9-]+--photogallery-myapp\.netlify\.app$/i.test(origin || "");

        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin) || netlifyPreview) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    }
}));

app.use(express.json());

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
    });
});

//routes
app.use("/api/photos", photoRoutes);

async function startServer() {
    if (!process.env.MONGO_URI) {
        console.error("MONGO_URI is not set.");
        process.exit(1);
    }

    try {
        //mongodb connection
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000
        });

        console.log("MongoDB connected");

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
}

startServer();
