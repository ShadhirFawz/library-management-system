const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const membershipController = require("../controllers/membershipController");

/**
 * @swagger
 * /api/memberships:
 *   post:
 *     summary: Create a new membership (Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               duration:
 *                 type: number
 *     responses:
 *       201:
 *         description: Membership created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/", authenticate, authorize("ADMIN"), membershipController.createMembership);

/**
 * @swagger
 * /api/memberships:
 *   get:
 *     summary: Get all memberships
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of memberships
 *       401:
 *         description: Unauthorized
 */
router.get("/", authenticate, membershipController.getMemberships);

module.exports = router;