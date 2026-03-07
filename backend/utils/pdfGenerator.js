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
            // Helper to get days correctly
            let daysList = [];
            const extractDays = (data) => {
                if (!data) return [];
                if (Array.isArray(data)) return data;
                if (Array.isArray(data.days)) return data.days;
                if (Array.isArray(data.itinerary)) return data.itinerary;
                if (Array.isArray(data.dailyPlan)) return data.dailyPlan;

                const dayKeys = Object.keys(data).filter(k => k.toLowerCase().includes('day'));
                if (dayKeys.length > 0) {
                    const hasArrayValues = dayKeys.some(k => Array.isArray(data[k]));
                    if (hasArrayValues) {
                        return dayKeys.map((k, i) => ({
                            day: i + 1,
                            title: k,
                            places: Array.isArray(data[k]) ? data[k] : []
                        }));
                    }
                }

                const values = Object.values(data);
                for (const val of values) {
                    if (Array.isArray(val) && val.length > 0 && val[0] && typeof val[0] === 'object' && (val[0].day || val[0].places || val[0].activities || val[0].plan)) {
                        return val;
                    }
                    if (typeof val === 'object' && val !== null) {
                        const subValues = Object.values(val);
                        for (const subVal of subValues) {
                            if (Array.isArray(subVal) && subVal.length > 0 && subVal[0] && typeof subVal[0] === 'object' && (subVal[0].day || subVal[0].places || subVal[0].activities || subVal[0].plan)) {
                                return subVal;
                            }
                        }
                    }
                }

                const anyArray = values.find(val => Array.isArray(val));
                if (anyArray) {
                    return [{
                        day: 1,
                        title: "Day 1",
                        places: anyArray
                    }];
                }
                return [];
            };

            daysList = extractDays(itineraryData);

            if (daysList.length > 0) {
                daysList.forEach((day, index) => {
                    const dayNum = day.day || (index + 1);
                    const dayTitle = day.title || "Day";

                    doc
                        .fillColor("#2980b9")
                        .fontSize(16)
                        .font("Helvetica-Bold")
                        .text(`Day ${dayNum}: ${dayTitle}`)
                        .moveDown(0.5);

                    const activitiesList = Array.isArray(day.activities) ? day.activities :
                        (Array.isArray(day.places) ? day.places :
                            (Array.isArray(day.plan) ? day.plan : []));

                    if (activitiesList.length > 0) {
                        activitiesList.forEach((activity, idx) => {
                            let actName = `Activity ${idx + 1}`;
                            let actTime = '';

                            if (typeof activity === 'string') {
                                actName = activity;
                            } else if (activity) {
                                actName = activity.name || activity.location || activity.description || actName;
                                actTime = activity.time ? ` (${activity.time})` : '';

                                // Failsafe if the entire array element was blindly stringified into object Object
                                if (actName === '[object Object]') {
                                    actName = JSON.stringify(activity);
                                }
                            }

                            doc
                                .fillColor("#34495e")
                                .fontSize(12)
                                .font("Helvetica")
                                .text(`- ${actName}${actTime}`, {
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
