const express = require("express");
const router = express.Router();

const Photo = require("../models/Photo");

//create photo
router.post("/", async (req, res) => {
    try {
        const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
        const imageUrl = typeof req.body.imageUrl === "string" ? req.body.imageUrl.trim() : "";

        if (!title || !imageUrl) {
            return res.status(400).json({ message: "Title and image URL are required" });
        }

        const photo = await Photo.create({ title, imageUrl });
        res.status(201).json(photo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

//read data
router.get("/", async (req, res) => {
    try {
        const photos = await Photo.find();
        res.json(photos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//update photo
router.put("/:id", async (req, res) => {
    try {
        const updates = {};
        if (typeof req.body.title === "string") updates.title = req.body.title.trim();
        if (typeof req.body.imageUrl === "string") updates.imageUrl = req.body.imageUrl.trim();

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "Nothing to update" });
        }

        const photo = await Photo.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!photo) {
            return res.status(404).json({ message: "Photo not found" });
        }

        res.json(photo);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

//delete photo
router.delete("/:id", async (req, res) => {
    try {
        const photo = await Photo.findByIdAndDelete(req.params.id);

        if (!photo) {
            return res.status(404).json({ message: "Photo not found" });
        }

        res.json({ message: "Photo deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
