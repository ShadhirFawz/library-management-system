const Ticket = require('../models/Ticket');

// USER - Raise a new ticket
const raiseTicket = async (req, res) => {
  try {
    const { subject, description } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ error: 'Subject and description are required' });
    }

    const ticket = await Ticket.create({
      subject,
      description,
      raisedBy: req.user.userId
    });

    res.status(201).json({ message: 'Ticket raised successfully', ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// USER - View own tickets
const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ raisedBy: req.user.userId }).sort({ createdAt: -1 });
    res.json({ count: tickets.length, tickets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN - View all tickets
const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json({ count: tickets.length, tickets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN - Respond to a ticket
const respondToTicket = async (req, res) => {
  try {
    const { response, status } = req.body;

    if (!response) {
      return res.status(400).json({ error: 'Response message is required' });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        adminResponse: response,
        respondedBy: req.user.userId,
        status: status || 'in_progress'
      },
      { new: true }
    );

    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    res.json({ message: 'Response sent', ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { raiseTicket, getMyTickets, getAllTickets, respondToTicket };