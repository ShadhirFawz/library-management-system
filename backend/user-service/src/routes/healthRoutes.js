const express = require("express");
const router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check service health
 *     description: Returns status of the User Service
 *     responses:
 *       200:
 *         description: Service is running
 */
router.get("/", (req, res) => {
  res.json({
    service: "user-service",
    status: "running",
    timestamp: new Date()
  });
});

module.exports = router;