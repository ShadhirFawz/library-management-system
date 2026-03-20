const express = require("express");
const router = express.Router();
const {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
} = require("../controllers/articleController");
const {
  authenticate,
  adminOnly,
  authorizeRoles,
} = require("../middleware/auth");

/**
 * @openapi
 * /api/faq:
 *   get:
 *     summary: List FAQs
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of FAQs
 *   post:
 *     summary: Create a FAQ (admin/librarian)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Created
 */
// USER - read FAQs (no login needed)
router.get("/", getAllArticles); // get all FAQs
router.get("/:id", getArticleById); // get one FAQ

// ADMIN/LIBRARIAN - manage FAQs
// allow both admin and librarian to manage FAQs
router.post(
  "/",
  authenticate,
  authorizeRoles("admin", "librarian"),
  createArticle,
); // create
router.put(
  "/:id",
  authenticate,
  authorizeRoles("admin", "librarian"),
  updateArticle,
); // update
router.delete(
  "/:id",
  authenticate,
  authorizeRoles("admin", "librarian"),
  deleteArticle,
); // delete

module.exports = router;
