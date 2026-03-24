const express = require("express");
const router = express.Router();
const { generateItineraryPDF } = require("../utils/pdfGenerator");
const fs = require("fs");
const path = require("path");

// 1. PDF Generation Endpoint
router.post("/generate", async (req, res, next) => {
    try {
        console.log("📄 Generating PDF for Itinerary...");

        // Use the entire body so we have access to destination, origin, and interests
        const filePath = await generateItineraryPDF(req.body, `itinerary-${Date.now()}.pdf`);

        // Set headers and stream the PDF response
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", 'attachment; filename="itinerary.pdf"');

        const stream = fs.createReadStream(filePath);
        stream.pipe(res);

        // Optional: Delete the temp file after streaming
        stream.on("end", () => {
            fs.unlink(filePath, (err) => {
                if (err) console.error("Error deleting temp PDF file:", err);
                else console.log("🧹 Temp PDF file cleared.");
            });
        });

    } catch (error) {
        console.error("🔥 PDF GENERATION ERROR:", error.message);
        res.status(500).json({ error: "Failed to generate PDF inside Node.js" });
    }
});

module.exports = router;
