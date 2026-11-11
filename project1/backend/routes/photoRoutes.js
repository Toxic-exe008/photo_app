const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const router = express.Router();

const Photo = require("../models/Photo");

const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter(req, file, callback) {
        if (!allowedTypes.includes(file.mimetype)) {
            return callback(new Error("Please upload a JPEG, PNG, WebP or GIF image."));
        }

        callback(null, true);
    }
});

const getBucket = () => new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "photoImages"
});

function uploadImage(req, res, next) {
    upload.single("image")(req, res, (error) => {
        if (error) {
            const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
            return res.status(status).json({ message: error.message });
        }

        next();
    });
}

function saveImage(file) {
    return new Promise((resolve, reject) => {
        const uploadStream = getBucket().openUploadStream(file.originalname, {
            contentType: file.mimetype,
            metadata: {
                originalName: file.originalname,
                contentType: file.mimetype
            }
        });

        uploadStream.on("error", reject);
        uploadStream.on("finish", () => resolve(uploadStream.id));
        uploadStream.end(file.buffer);
    });
}

async function removeImage(imageId) {
    if (!imageId) return;

    try {
        await getBucket().delete(imageId);
    } catch (error) {
        console.error("Could not remove the stored image:", error.message);
    }
}

//create photo
router.post("/", uploadImage, async (req, res) => {
    let imageId = null;

    try {
        const title = typeof req.body.title === "string" ? req.body.title.trim() : "";
        const description = typeof req.body.description === "string" ? req.body.description.trim() : "";
        const imageUrl = typeof req.body.imageUrl === "string" ? req.body.imageUrl.trim() : "";

        if (!title) {
            return res.status(400).json({ message: "Photo title is required" });
        }

        if (!req.file && !imageUrl) {
            return res.status(400).json({ message: "Choose an image or enter an image URL" });
        }

        if (req.file) {
            imageId = await saveImage(req.file);
        }

        const photo = await Photo.create({
            title,
            description,
            imageUrl: req.file ? "" : imageUrl,
            imageId
        });

        res.status(201).json(photo);
    } catch (error) {
        await removeImage(imageId);
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

router.get("/:id/image", async (req, res) => {
    try {
        const photo = await Photo.findById(req.params.id);

        if (!photo || !photo.imageId) {
            return res.status(404).json({ message: "Uploaded image not found" });
        }

        const downloadStream = getBucket().openDownloadStream(photo.imageId);

        downloadStream.on("file", (file) => {
            res.set({
                "Content-Type": file.contentType || file.metadata?.contentType || "application/octet-stream",
                "Content-Length": file.length,
                "Cache-Control": "no-store",
                "X-Content-Type-Options": "nosniff"
            });
        });

        downloadStream.on("error", () => {
            if (!res.headersSent) {
                res.status(404).json({ message: "Uploaded image not found" });
            } else {
                res.end();
            }
        });

        downloadStream.pipe(res);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

//update photo
router.put("/:id", uploadImage, async (req, res) => {
    let newImageId = null;

    try {
        const photo = await Photo.findById(req.params.id);

        if (!photo) {
            return res.status(404).json({ message: "Photo not found" });
        }

        const title = typeof req.body.title === "string" ? req.body.title.trim() : null;
        const description = typeof req.body.description === "string" ? req.body.description.trim() : null;
        const imageUrl = typeof req.body.imageUrl === "string" ? req.body.imageUrl.trim() : "";

        if (title !== null) photo.title = title;
        if (description !== null) photo.description = description;

        const oldImageId = photo.imageId;

        if (req.file) {
            newImageId = await saveImage(req.file);
            photo.imageId = newImageId;
            photo.imageUrl = "";
        } else if (imageUrl) {
            photo.imageUrl = imageUrl;
            photo.imageId = null;
        }

        if (title === null && description === null && !req.file && !imageUrl) {
            return res.status(400).json({ message: "Nothing to update" });
        }

        await photo.save();

        if (oldImageId && (req.file || imageUrl)) {
            await removeImage(oldImageId);
        }

        res.json(photo);
    } catch (error) {
        await removeImage(newImageId);
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

        await removeImage(photo.imageId);
        res.json({ message: "Photo deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
