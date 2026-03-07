const express = require("express");
const Trip = require("../models/Trip");
const {
    generateTrip,
    createTripManual,
    getAllTrips,
    getTripById,
    updateTrip,
    deleteTrip,
    getSharedTrip,
    regenerateTrip
} = require("../controllers/tripController");
const { downloadTripPDF } = require("../controllers/pdfController");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Trips
 *     description: Trip Management API
 */

/*
==================================
CREATE TRIP (AI GENERATED)
POST /api/trips/generate
==================================
*/
// Keep the existing AI generation route
router.post("/generate", auth, generateTrip);

/*
==================================
CREATE TRIP (MANUAL)
POST /api/trips
==================================
*/
router.post("/", auth, createTripManual);

/*
==================================
GET ALL TRIPS
GET /api/trips
==================================
*/
router.get("/", auth, getAllTrips);

/*
==================================
GET SINGLE TRIP
GET /api/trips/:id
==================================
*/
router.get("/:id", auth, getTripById);

/*
==================================
GET SHARED TRIP (PUBLIC)
GET /api/trips/share/:id
==================================
*/
router.get("/share/:id", getSharedTrip);

/*
==================================
UPDATE TRIP
PUT /api/trips/:id
==================================
*/
// ✅ Re-runs AI itinerary generation
router.put("/:id", auth, updateTrip);

/*
==================================
DELETE TRIP
DELETE /api/trips/:id
==================================
*/
router.delete("/:id", auth, deleteTrip);

/*
==================================
REGENERATE TRIP
POST /api/trips/:id/regenerate
==================================
*/
router.post("/:id/regenerate", auth, regenerateTrip);

/*
==================================
DOWNLOAD PDF
GET /api/trips/:id/download
==================================
*/
router.get("/:id/download", auth, downloadTripPDF);

module.exports = router;
