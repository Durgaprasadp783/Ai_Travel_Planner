const express = require("express");
const Trip = require("../models/Trip");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();



/**
 * @swagger
 * tags:
 *   name: Trips
 *   description: Trip Management API
 */

/**
 * @swagger
 * /api/trips:
 *   post:
 *     summary: Create a new trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - destination
 *               - days
 *               - userEmail
 *             properties:
 *               destination:
 *                 type: string
 *               days:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               budget:
 *                 type: number
 *               userEmail:
 *                 type: string
 *     responses:
 *       201:
 *         description: Trip created successfully
 *       500:
 *         description: Server error
 */
router.post("/", authMiddleware, async (req, res) => {
    try {
        const newTrip = new Trip({
            ...req.body,
            user: req.user.userId
        });

        const savedTrip = await newTrip.save();
        res.status(201).json(savedTrip);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


/**
 * @swagger
 * /api/trips:
 *   get:
 *     summary: Get all trips
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of trips
 *       500:
 *         description: Server error
 */
router.get("/", authMiddleware, async (req, res) => {
    try {
        const trips = await Trip.find({ user: req.user.userId });
        res.json(trips);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


/**
 * @swagger
 * /api/trips/{id}:
 *   put:
 *     summary: Update a trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The trip ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               destination:
 *                 type: string
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *     responses:
 *       200:
 *         description: Trip updated successfully
 *       404:
 *         description: Trip not found
 *       500:
 *         description: Server error
 */
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const updatedTrip = await Trip.findOneAndUpdate(
            { _id: req.params.id, user: req.user.userId },
            req.body,
            { new: true }
        );

        if (!updatedTrip)
            return res.status(404).json({ message: "Trip not found" });

        res.json(updatedTrip);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


/**
 * @swagger
 * /api/trips/{id}:
 *   delete:
 *     summary: Delete a trip
 *     tags: [Trips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The trip ID
 *     responses:
 *       200:
 *         description: Trip deleted successfully
 *       404:
 *         description: Trip not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const deletedTrip = await Trip.findOneAndDelete({
            _id: req.params.id,
            user: req.user.userId
        });

        if (!deletedTrip)
            return res.status(404).json({ message: "Trip not found" });

        res.json({ message: "Trip deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
