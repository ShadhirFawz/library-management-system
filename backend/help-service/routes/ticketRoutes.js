const express = require("express");
const router = express.Router();
const {
  raiseTicket,
  getMyTickets,
  getAllTickets,
  respondToTicket,
} = require("../controllers/ticketController");
const {
  authenticate,
  adminOnly,
  authorizeRoles,
} = require("../middleware/auth");

/**
 * @openapi
 * /api/tickets:
 *   post:
 *     summary: Raise a new support ticket
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: Ticket created
 * /api/tickets/my:
 *   get:
 *     summary: List my tickets
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tickets
 * /api/tickets/all:
 *   get:
 *     summary: List all tickets (admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tickets
 * /api/tickets/{id}/respond:
 *   put:
 *     summary: Respond to a ticket (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *     responses:
 *       200:
 *         description: Updated ticket
 */
// USER
router.post("/", authenticate, raiseTicket); // raise a ticket
router.get("/my", authenticate, getMyTickets); // view own tickets

// ADMIN
// allow librarians to view/respond to tickets
router.get(
  "/all",
  authenticate,
  authorizeRoles("admin", "librarian"),
  getAllTickets,
); // view all tickets
router.put(
  "/:id/respond",
  authenticate,
  authorizeRoles("admin", "librarian"),
  respondToTicket,
); // respond to a ticket

module.exports = router;
