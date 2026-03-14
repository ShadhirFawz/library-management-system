const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const userController = require("../controllers/userController");

router.get("/profile", authMiddleware, userController.getProfile);

router.put("/profile", authMiddleware, userController.updateProfile);

router.get("/profile", authenticate, userController.getProfile);

router.put("/profile", authenticate, userController.updateProfile);

router.get("/", authenticate, authorize("ADMIN"), userController.getAllUsers);

router.get("/:id", authenticate, authorize("ADMIN"), userController.getUserById);

router.put("/:id/role", authenticate, authorize("ADMIN"), userController.updateUserRole);

module.exports = router;