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
        maxlength: 500
    },

    imageUrl: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Photo", photoSchema);
