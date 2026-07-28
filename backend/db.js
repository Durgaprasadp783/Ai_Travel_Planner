const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const mongoose = require("mongoose");

const localMongoUri = "mongodb://127.0.0.1:27017/ai_travel_planner";
const mongoUri = process.env.MONGO_URI?.trim() || localMongoUri;

async function connectDB() {
    try {
        await mongoose.connect(mongoUri);
        console.log("MongoDB Connected Successfully");
    } catch (initialError) {
        console.error("MongoDB connection failed:", initialError.message);

        if (mongoUri !== localMongoUri) {
            console.log("Attempting local MongoDB fallback...");
            try {
                await mongoose.connect(localMongoUri);
                console.log("MongoDB Connected Successfully to local MongoDB");
                return;
            } catch (fallbackError) {
                console.error("Local fallback failed:", fallbackError.message);
                throw fallbackError;
            }
        }

        throw initialError;
    }
}

module.exports = connectDB;
