const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/**
 * Generates a travel itinerary PDF.
 * @param {Object} itineraryData - The itinerary data object.
 * @param {string} [filename="itinerary.pdf"] - Optional filename.
 * @returns {Promise<string>} - The path to the generated PDF.
 */
const generateItineraryPDF = (itineraryData, filename = "itinerary.pdf") => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: "A4" });
            const filePath = path.join(__dirname, "..", "tmp", filename);

            // Ensure tmp directory exists
            if (!fs.existsSync(path.dirname(filePath))) {
                fs.mkdirSync(path.dirname(filePath), { recursive: true });
            }

            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Title
            doc
                .fillColor("#2c3e50")
                .fontSize(24)
                .font("Helvetica-Bold")
                .text("AI Travel Planner Itinerary", { align: "center" })
                .moveDown(1);

            // Destination
            doc
                .fillColor("#34495e")
                .fontSize(14)
                .font("Helvetica")
                .text(`Destination: ${itineraryData.destination || "Unknown"}`)
                .moveDown(0.5);

            // Overview
            if (itineraryData.overview) {
                doc
                    .fillColor("#7f8c8d")
                    .fontSize(10)
                    .font("Helvetica-Oblique")
                    .text(itineraryData.overview)
                    .moveDown(1);
            }

            // Divider
            doc
                .moveTo(50, doc.y)
                .lineTo(545, doc.y)
                .strokeColor("#bdc3c7")
                .stroke()
                .moveDown(1);

            // Daily Plan
            if (Array.isArray(itineraryData.dailyPlan)) {
                itineraryData.dailyPlan.forEach((day) => {
                    const dayNum = day.day || "?";
                    const dayTitle = day.title || "Day";

                    doc
                        .fillColor("#2980b9")
                        .fontSize(16)
                        .font("Helvetica-Bold")
                        .text(`Day ${dayNum}: ${dayTitle}`)
                        .moveDown(0.5);

                    if (Array.isArray(day.activities)) {
                        day.activities.forEach((activity) => {
                            doc
                                .fillColor("#34495e")
                                .fontSize(12)
                                .font("Helvetica")
                                .text(`- ${activity}`, {
                                    indent: 20,
                                    lineGap: 5,
                                });
                        });
                    } else if (day.description) {
                        doc
                            .fillColor("#34495e")
                            .fontSize(12)
                            .font("Helvetica")
                            .text(day.description);
                    }

                    // Weather info if available
                    if (day.weather) {
                        doc
                            .moveDown(0.2)
                            .fillColor("#95a5a6")
                            .fontSize(10)
                            .font("Helvetica-Oblique")
                            .text(`Forecast: ${day.weather}`, { indent: 20 });
                    }

                    doc.moveDown(1.5);

                    // Page break if too close to bottom
                    if (doc.y > 700) {
                        doc.addPage();
                    }
                });
            }

            doc.end();

            stream.on("finish", () => resolve(filePath));
            stream.on("error", (err) => reject(err));
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = { generateItineraryPDF };
