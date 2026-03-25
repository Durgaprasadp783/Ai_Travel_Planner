const PDFDocument = require('pdfkit');
const Trip = require('../models/Trip');

/**
 * Generates and streams a PDF version of the travel itinerary.
 */
exports.downloadTripPDF = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: "Trip not found" });

        res.setHeader('Content-disposition', `attachment; filename=${trip.destination}_Itinerary.pdf`);
        res.setHeader('Content-type', 'application/pdf');

        const doc = new PDFDocument();
        doc.pipe(res);

        // --- PDF Header ---
        doc.fontSize(22).fillColor('#2c3e50').text(`Trip to ${trip.destination}`, { align: 'center' });
        doc.moveDown(0.5);
        // 1. Format the Mode and Interests safely
        const safeMode = trip.mode || 'Standard';
        
        // Check if interests exist in the DB and join them with a comma
        const safeInterests = trip.interests && trip.interests.length > 0 
            ? trip.interests.join(', ') 
            : 'General Exploration';

        // 2. Print them to the PDF with updated styling
        doc.fontSize(12).fillColor('#7f8c8d').text(`Travel Personality: ${safeMode}`, { align: 'center' });
        doc.fontSize(12).fillColor('#d35400').text(`Specified Interests: ${safeInterests}`, { align: 'center' }); 
        doc.fontSize(12).fillColor('#27ae60').text(`Trip Budget: $${trip.budget}`, { align: 'center' });
        doc.moveDown(1.5);

        // --- Daily Schedule ---
        if (trip.itinerary && trip.itinerary.dailyPlan) {
            trip.itinerary.dailyPlan.forEach(day => {
                // Day Title & Budget
                doc.fontSize(16).fillColor('#2980b9').text(`Day ${day.day}: ${day.title}`);
                if (day.dailyBudgetAllocated) {
                    doc.fontSize(10).fillColor('#c0392b').text(`Daily Budget: $${day.dailyBudgetAllocated}`);
                }
                doc.moveDown(0.5);

                // Print Activities & Meals safely
                day.activities.forEach(act => {
                    // Check if the old "fallback" strings are still in the DB
                    if (typeof act === 'string') {
                        doc.fontSize(11).fillColor('#34495e').text(`• ${act}`);
                    }
                    // Handle the new rich objects properly
                    else if (typeof act === 'object') {
                        const timeStr = act.time ? `${act.time} - ` : '';
                        const costStr = act.estimatedCost ? ` ($${act.estimatedCost})` : ' (Free)';

                        // Bold the Name, Time, and Cost
                        doc.fontSize(12).fillColor('#2c3e50').text(`• ${timeStr}${act.name}${costStr}`);

                        // Print the description slightly indented
                        if (act.description) {
                            doc.fontSize(10).fillColor('#7f8c8d').text(`   ${act.description}`);
                        }
                    }
                    doc.moveDown(0.3);
                });

                if (day.weather && day.weather !== "No forecast available") {
                    const weatherStr = typeof day.weather === 'string'
                        ? day.weather
                        : `${day.weather.condition}, ${day.weather.avgTemp}°C`;

                    doc.moveDown(0.2)
                        .fillColor('#4a5568')
                        .fontSize(9)
                        .font('Helvetica')
                        .text(`Forecast: ${weatherStr}`, { indent: 20 });
                }

                doc.moveDown(1);
            });
        } else {
            doc.fontSize(14).text("No detailed itinerary available for this trip.");
        }

        doc.end();
    } catch (err) {
        console.error("PDF Error:", err);
        res.status(500).json({ error: "Failed to generate PDF" });
    }
};
