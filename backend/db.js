const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ai_travel_planner")
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch((err) => console.log(err));

module.exports = mongoose;
