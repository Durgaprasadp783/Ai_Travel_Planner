const { generateItineraryPDF } = require("./utils/pdfGenerator");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

async function test() {
    console.log("🚀 Testing Enhanced PDF Generator...");

    // Test Case 1: Flat Array Shape
    const mockData = {
        destination: "Paris, France",
        overview: "A romantic getaway featuring the Eiffel Tower and Louvre.",
        days: [
            {
                day: 1,
                title: "Introduction to Paris",
                places: [
                    { name: "Eiffel Tower", time: "09:00 AM", location: "Champ de Mars, 5 Av. Anatole France, 75007 Paris" },
                    { name: "Louvre Museum", time: "01:00 PM", location: "Rue de Rivoli, 75001 Paris" }
                ],
                weather: "Sunny, 22°C"
            }
        ]
    };

    // Test Case 2: Nested Itinerary Shape
    const nestedData = {
        destination: "Tokyo, Japan",
        itinerary: {
            days: [
                {
                    day: 1,
                    title: "Shibuya and Harajuku",
                    activities: [
                        { name: "Shibuya Crossing", time: "10:00 AM", address: "Shibuya, Tokyo" },
                        { name: "Meiji Jingu", time: "02:00 PM", address: "Yoyogi Kamizonocho, Shibuya" }
                    ]
                }
            ]
        }
    };

    try {
        console.log("--- Running Test 1 (Flat) ---");
        const filename1 = `test-flat-${Date.now()}.pdf`;
        const filePath1 = await generateItineraryPDF(mockData, filename1);
        console.log("✅ Flat PDF Generated Successfully at:", filePath1);

        console.log("--- Running Test 2 (Nested) ---");
        const filename2 = `test-nested-${Date.now()}.pdf`;
        const filePath2 = await generateItineraryPDF(nestedData, filename2);
        console.log("✅ Nested PDF Generated Successfully at:", filePath2);

    } catch (err) {
        console.error("❌ Test Failed:", err);
    }
}

test();
