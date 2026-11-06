const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

//mongodb connection
mongoose.connect("mongodb+srv://toxic:toxic008@cluster0.llpmie2.mongodb.net/photogallery")
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

//routes
app.use("/api/photos", require("./routes/photoRoutes"));

app.listen(5000, () => {
    console.log("Server running on port 5000");
});