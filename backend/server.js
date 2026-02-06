require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth'); // Import the routes

const app = express();

// Middleware
app.use(express.json()); // Allows parsing JSON bodies
app.use(cors()); // Prevents CORS errors connecting to frontend

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB Connection Error:", err));

// Use Routes
app.use('/api/auth', authRoutes); // URLs will be /api/auth/login, etc.

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));