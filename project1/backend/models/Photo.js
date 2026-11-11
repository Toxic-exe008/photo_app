const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },

    description: {
        type: String,
        default: "",
        trim: true,
        maxlength: 500
    },

    imageUrl: {
        type: String,
        default: "",
        trim: true
    },

    imageId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    }
});

photoSchema.path("imageUrl").validate(function () {
    return Boolean(this.imageUrl || this.imageId);
}, "An image URL or uploaded image is required.");

module.exports = mongoose.model("Photo", photoSchema);
