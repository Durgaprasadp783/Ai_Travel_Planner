require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const tripRoutes = require("./routes/tripRoutes");
const mapsRoutes = require("./routes/mapsRoutes.js");


const app = express();

// =====================
// Middleware
// =====================
app.use(cors());
app.use(express.json());

// =====================
// Routes
// =====================
// This handles authentication (Login/Register)
app.use("/api/auth", authRoutes);

// This adds the /api/trips prefix to everything inside tripRoutes.js
// Your POST request will now be: http://localhost:5000/api/trips/generate
app.use("/api/trips", tripRoutes);
app.use("/api/maps", mapsRoutes);

// =====================
// Database Connection
// =====================
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Database Connection Error: ${error.message}`);
        process.exit(1);
    }
};

// Execute Database Connection
connectDB();

// =====================
// Start Server
// =====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});