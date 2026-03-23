const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

/**
 * Generates a travel itinerary PDF.
 * @param {Object} itineraryData - The itinerary data object.
 * @param {string} [filename="itinerary.pdf"] - Optional filename.
 * @returns {Promise<string>} - The path to the generated PDF.
 */
const generateItineraryPDF = (itineraryData, filename = "itinerary.pdf") => {
    return new Promise(async (resolve, reject) => {
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

            // Destination and Origin Info
            const destination = itineraryData.destination || "Unknown Destination";
            const origin = itineraryData.origin || "";

            doc
                .fillColor("#34495e")
                .fontSize(18)
                .font("Helvetica-Bold")
                .text(destination, { align: "center" });

            if (origin) {
                doc
                    .fillColor("#7f8c8d")
                    .fontSize(12)
                    .font("Helvetica")
                    .text(`Starting Point: ${origin}`, { align: "center" });
            }
            doc.moveDown(0.5);

            // --- STATIC MAP INTEGRATION ---
            const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
            if (GOOGLE_API_KEY) {
                try {
                    const startLoc = itineraryData.originCoordinates ? `${itineraryData.originCoordinates[1]},${itineraryData.originCoordinates[0]}` : origin;
                    const endLoc = itineraryData.destinationCoordinates ? `${itineraryData.destinationCoordinates[1]},${itineraryData.destinationCoordinates[0]}` : destination;

                    let markers = `markers=color:red|label:S|${encodeURIComponent(startLoc || endLoc)}`;
                    if (startLoc && endLoc && startLoc !== endLoc) {
                        markers += `&markers=color:blue|label:E|${encodeURIComponent(endLoc)}`;
                    }

                    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?size=600x320&maptype=roadmap&${markers}&key=${GOOGLE_API_KEY}`;

                    const response = await axios.get(mapUrl, { responseType: 'arraybuffer' });
                    const imageBuffer = Buffer.from(response.data, 'binary');
                    doc.image(imageBuffer, {
                        fit: [500, 260],
                        align: 'center',
                        valign: 'center'
                    });
                    doc.moveDown(1);
                } catch (mapErr) {
                    console.error("Static Map Fetch Error:", mapErr.message);
                    let errorMsg = "(Map could not be loaded)";
                    if (mapErr.response && mapErr.response.status === 403) {
                        errorMsg = "(Map Error: 403 Forbidden - Please enable 'Maps Static API')";
                        console.error("403 ERROR DETECTED: You must enable 'Maps Static API' in Google Cloud Console.");
                    }
                    doc.fontSize(10).fillColor("#e74c3c").text(errorMsg, { align: "center" }).moveDown(1);
                }
            }

            // Overview
            if (itineraryData.overview) {
                doc
                    .fillColor("#7f8c8d")
                    .fontSize(11)
                    .font("Helvetica-Oblique")
                    .text(itineraryData.overview, { align: "center" })
                    .moveDown(1);
            }

            // Divider
            doc
                .moveTo(50, doc.y)
                .lineTo(545, doc.y)
                .strokeColor("#bdc3c7")
                .stroke()
                .moveDown(1);

            // Daily Plan Extraction Logic
            const extractDays = (data) => {
                if (!data) return [];
                const target = data.itinerary || data;
                if (Array.isArray(target)) return target;
                if (Array.isArray(target.days)) return target.days;
                if (Array.isArray(target.itinerary)) return target.itinerary;
                if (Array.isArray(target.dailyPlan)) return target.dailyPlan;

                const dayKeys = Object.keys(target).filter(k => k.toLowerCase().includes('day'));
                if (dayKeys.length > 0) {
                    const hasArrayValues = dayKeys.some(k => Array.isArray(target[k]));
                    if (hasArrayValues) {
                        return dayKeys.sort().map((k, i) => ({
                            day: i + 1,
                            title: k,
                            activities: Array.isArray(target[k]) ? target[k] : []
                        }));
                    }
                }

                const values = Object.values(target);
                for (const val of values) {
                    if (Array.isArray(val) && val.length > 0 && val[0] && typeof val[0] === 'object' && (val[0].day || val[0].places || val[0].activities || val[0].plan)) {
                        return val;
                    }
                }

                const anyArray = values.find(val => Array.isArray(val));
                if (anyArray) {
                    return [{
                        day: 1,
                        title: "Plan",
                        activities: anyArray
                    }];
                }
                return [];
            };

            const daysList = extractDays(itineraryData);

            if (daysList.length > 0) {
                daysList.forEach((day, index) => {
                    const dayNum = day.day || (index + 1);
                    const dayTitle = day.title || `Day ${dayNum}`;

                    if (doc.y > 650) doc.addPage();

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
                        activitiesList.forEach((act, idx) => {
                            let actName = `Activity ${idx + 1}`;
                            let actTime = '';
                            let actLoc = '';

                            if (typeof act === 'string') {
                                actName = act;
                            } else if (act && typeof act === 'object') {
                                actName = act.name || act.title || actName;
                                actTime = act.time ? ` [${act.time}]` : '';
                                actLoc = act.location || act.address || '';
                            }

                            doc
                                .fillColor("#34495e")
                                .fontSize(12)
                                .font("Helvetica-Bold")
                                .text(`• ${actName}${actTime}`, { indent: 20 });

                            if (actLoc && actLoc !== actName) {
                                doc
                                    .fillColor("#7f8c8d")
                                    .fontSize(10)
                                    .font("Helvetica")
                                    .text(`  Location: ${actLoc}`, { indent: 30 });
                            }
                            doc.moveDown(0.3);
                        });
                    } else if (day.description) {
                        doc
                            .fillColor("#34495e")
                            .fontSize(11)
                            .font("Helvetica")
                            .text(day.description, { indent: 20 });
                    }

                    if (day.weather && day.weather !== "No forecast available") {
                        const weatherStr = typeof day.weather === 'string' 
                            ? day.weather 
                            : `${day.weather.condition}, ${day.weather.avgTemp}°C`;

                        doc
                            .moveDown(0.2)
                            .fillColor("#16a085")
                            .fontSize(10)
                            .font("Helvetica-Oblique")
                            .text(`Forecast: ${weatherStr}`, { indent: 20 });
                    }

                    doc.moveDown(1);
                });
            } else {
                doc.fontSize(14).fillColor("#e74c3c").text("No itinerary details found.", { align: "center" });
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
