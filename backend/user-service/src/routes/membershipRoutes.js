const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const membershipController = require("../controllers/membershipController");

router.post("/", authenticate, authorize("ADMIN"), membershipController.createMembership);

router.get("/", authenticate, membershipController.getMemberships);

module.exports = router;