const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/ai_travel_planner")
    .then(() => {
        console.log("MongoDB Connected Successfully");
    })
    .catch((error) => {
        console.log("MongoDB Connection Error:", error);
    });
