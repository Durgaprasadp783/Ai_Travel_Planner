const nodemailer = require('nodemailer');

/**
 * Sends an email with the trip itinerary PDF as an attachment.
 * Silently skips if SMTP credentials are not configured.
 */
exports.sendTripEmail = async (userEmail, trip, pdfBuffer) => {
    // Guard: skip email entirely if SMTP is not configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log("⚠️ Email skipped: EMAIL_USER / EMAIL_PASS not set in .env");
        return null;
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: '"AI Travel Planner" <itinerary@travelplanner.ai>',
            to: userEmail,
            subject: `Your Perfect Journey to ${trip.destination} is Ready!`,
            text: `Hello,\n\nPlease find attached your custom travel itinerary for ${trip.destination}.\n\nSafe travels!\nThe AI Travel Planner Team`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #2c3e50;">Your Next Adventure Awaits!</h2>
                    <p>Hello,</p>
                    <p>We've designed a bespoke journey to <strong>${trip.destination}</strong> just for you.</p>
                    <p>Attached is a PDF version of your itinerary for easy offline access.</p>
                    <br/>
                    <p>Wishing you an incredible trip,</p>
                    <p><strong>The AI Travel Planner Team</strong></p>
                </div>
            `,
            attachments: [
                {
                    filename: `${trip.destination}_Itinerary.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("📧 Email sent successfully:", info.messageId);
        return info;
    } catch (error) {
        console.error("❌ Email error:", error);
        // We don't want to fail the whole trip generation if email fails
        return null;
    }
};
