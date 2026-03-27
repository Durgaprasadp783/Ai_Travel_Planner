const PDFDocument = require('pdfkit');
const Trip = require('../models/Trip');

/**
 * Core PDF Generation Logic
 * Returns a PDFDocument that can be piped to a stream or buffer.
 */
const generatePDFStream = (trip, doc) => {
    // --- PDF Header ---
    doc.fontSize(22).fillColor('#2c3e50').text(`Trip to ${trip.destination}`, { align: 'center' });
    doc.moveDown(0.5);
    
    const safeMode = trip.mode || 'Standard';
    const safeInterests = trip.interests && trip.interests.length > 0 
        ? trip.interests.join(', ') 
        : 'General Exploration';

    doc.fontSize(12).fillColor('#7f8c8d').text(`Travel Personality: ${safeMode}`, { align: 'center' });
    doc.fontSize(12).fillColor('#d35400').text(`Specified Interests: ${safeInterests}`, { align: 'center' }); 
    doc.fontSize(12).fillColor('#27ae60').text(`Trip Budget: ${trip.currency || 'USD'} ${trip.budget}`, { align: 'center' });
    doc.moveDown(1.5);

    // --- Daily Schedule ---
    if (trip.itinerary && trip.itinerary.dailyPlan) {
        trip.itinerary.dailyPlan.forEach(day => {
            doc.fontSize(16).fillColor('#2980b9').text(`Day ${day.day}: ${day.title}`);
            if (day.dailyBudgetAllocated) {
                doc.fontSize(10).fillColor('#c0392b').text(`Daily Budget: ${trip.currency || 'USD'} ${day.dailyBudgetAllocated}`);
            }
            doc.moveDown(0.5);

            day.activities.forEach(act => {
                if (typeof act === 'string') {
                    doc.fontSize(11).fillColor('#34495e').text(`• ${act}`);
                }
                else if (typeof act === 'object') {
                    const timeStr = act.time ? `${act.time} - ` : '';
                    const costStr = act.estimatedCost ? ` (${trip.currency || 'USD'} ${act.estimatedCost})` : ' (Free)';
                    doc.fontSize(12).fillColor('#2c3e50').text(`• ${timeStr}${act.name}${costStr}`);

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

                doc.moveDown(0.2).fillColor('#4a5568').fontSize(9).font('Helvetica').text(`Forecast: ${weatherStr}`, { indent: 20 });
            }
            doc.moveDown(1);
        });
    } else {
        doc.fontSize(14).text("No detailed itinerary available for this trip.");
    }
    doc.end();
};

/**
 * Controller for downloading PDF
 */
exports.downloadTripPDF = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: "Trip not found" });

        res.setHeader('Content-disposition', `attachment; filename=${trip.destination}_Itinerary.pdf`);
        res.setHeader('Content-type', 'application/pdf');

        const doc = new PDFDocument();
        doc.pipe(res);
        generatePDFStream(trip, doc);
    } catch (err) {
        console.error("PDF Download Error:", err);
        res.status(500).json({ error: "Failed to generate PDF" });
    }
};

/**
 * Utility to get PDF as a Buffer for emails
 */
exports.getPDFBuffer = async (trip) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
        generatePDFStream(trip, doc);
    });
};
