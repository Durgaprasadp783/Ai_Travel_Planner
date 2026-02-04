const express = require("express");
const app = express();

const User = require("./models/User");
const Trip = require("./models/Trip");
const Itinerary = require("./models/Itinerary");
require("./db");

app.get("/", (req, res) => {
    res.send("MongoDB is connected!");
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
