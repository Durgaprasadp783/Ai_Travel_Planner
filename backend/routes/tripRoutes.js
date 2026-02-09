// routes/tripRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
    generateTrip, // This is your AI-integrated creation function
    getTrips,
    updateTrip,
    deleteTrip
} = require("../controllers/tripController");

/**
 * @swagger
 * tags:
 * name: Trips
 * description: Trip Management API
 */

/**
 * @swagger
 * /api/trips:
 * post:
 * summary: Create a new AI-generated trip
 * tags: [Trips]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required: [destination, startDate, endDate]
 * properties:
 * destination: { type: string }
 * startDate: { type: string, format: date }
 * endDate: { type: string, format: date }
 * budget: { type: number }
 * get:
 * summary: Get all trips for the logged-in user
 * tags: [Trips]
 * security:
 * - bearerAuth: []
 */
router.post("/", auth, generateTrip);
router.get("/", auth, getTrips);

/**
 * @swagger
 * /api/trips/{id}:
 * put:
 * summary: Update a trip
 * tags: [Trips]
 * security:
 * - bearerAuth: []
 * delete:
 * summary: Delete a trip
 * tags: [Trips]
 * security:
 * - bearerAuth: []
 */
router.put("/:id", auth, updateTrip);
router.delete("/:id", auth, deleteTrip);

module.exports = router;