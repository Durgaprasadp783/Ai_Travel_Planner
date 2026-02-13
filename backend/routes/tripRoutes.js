// routes/tripRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
    generateTrip,
    getTrips,
    updateTrip,
    deleteTrip
} = require("../controllers/tripController");

/**
 * @swagger
 * tags:
 *   - name: Trips
 *     description: Trip Management API
 */

/**
 * @swagger
 * /api/trips/generate:
 *   post:
 *     summary: Create a new AI-generated trip with weather data
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [destination, startDate, endDate]
 *             properties:
 *               destination:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               budget:
 *                 type: string
 *               interests:
 *                 type: array
 *                 items:
 *                   type: string
 */

// 1. GENERATE TRIP (Updated path to /generate)
router.post("/generate", auth, generateTrip);

// 2. GET ALL TRIPS
router.get("/", auth, getTrips);

/**
 * @swagger
 * /api/trips/{id}:
 *   put:
 *     summary: Update a trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Delete a trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 */

// 3. UPDATE & DELETE
router.put("/:id", auth, updateTrip);
router.delete("/:id", auth, deleteTrip);

module.exports = router;