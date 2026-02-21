const express = require("express");
const axios = require("axios");
const router = express.Router();

// PDF Generation Endpoint
router.post("/generate", async (req, res) => {
    try {
        const { itinerary } = req.body;

        if (!itinerary) {
            return res.status(400).json({ error: "Itinerary data is required" });
        }

        // Call Python AI Service
        const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";
        const response = await axios.post(`${pythonServiceUrl}/api/pdf/generate-pdf`, itinerary, {
            responseType: "arraybuffer", // Important for binary data (PDF)
        });

        // Set headers and send PDF back to client
        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": 'attachment; filename="itinerary.pdf"',
        });

        res.send(response.data);
    } catch (error) {
        console.error("PDF Generation Error:", error.message);
        res.status(500).json({ error: "Failed to generate PDF" });
    }
});

module.exports = router;
