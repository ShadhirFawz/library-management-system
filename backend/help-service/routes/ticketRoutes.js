const express = require('express');
const router = express.Router();
const { raiseTicket, getMyTickets, getAllTickets, respondToTicket } = require('../controllers/ticketController');
const { authenticate, adminOnly } = require('../middleware/auth');

// USER
router.post('/', authenticate, raiseTicket);           // raise a ticket
router.get('/my', authenticate, getMyTickets);         // view own tickets

// ADMIN
router.get('/all', authenticate, adminOnly, getAllTickets);             // view all tickets
router.put('/:id/respond', authenticate, adminOnly, respondToTicket);  // respond to a ticket

module.exports = router;