const express = require("express");
const Trip = require("../models/Trip");
const { 
    generateTrip, 
    createTrip, 
    getAllTrips, 
    getTripById, 
    updateTrip, 
    deleteTrip 
} = require("../controllers/tripController");
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
router.post("/", createTrip);

/*
==================================
GET ALL TRIPS
GET /api/trips
==================================
*/
router.get("/", getAllTrips);

/*
==================================
GET SINGLE TRIP
GET /api/trips/:id
==================================
*/
router.get("/:id", getTripById);

/*
==================================
UPDATE TRIP
PUT /api/trips/:id
==================================
*/
// ✅ Re-runs AI itinerary generation
router.put("/:id", updateTrip);

/*
==================================
DELETE TRIP
DELETE /api/trips/:id
==================================
*/
router.delete("/:id", deleteTrip);

module.exports = router;