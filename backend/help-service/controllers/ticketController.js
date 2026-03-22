const Ticket = require("../models/Ticket");

// USER - Raise a new ticket
const raiseTicket = async (req, res) => {
  try {
    const { subject, description, category } = req.body;

    if (!subject || !description) {
      return res
        .status(400)
        .json({ error: "Subject and description are required" });
    }

    const ticket = await Ticket.create({
      subject,
      description,
      category: category || null,
      raisedBy: req.user.userId,
      raisedByName: req.user.fullName || req.user.fullname || null,
      status: "pending",
    });

    res.status(201).json({ message: "Ticket raised successfully", ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// USER - View own tickets
const getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ raisedBy: req.user.userId }).sort({
      createdAt: -1,
    });
    res.json({ count: tickets.length, tickets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN - View all tickets
const getAllTickets = async (req, res) => {
  try {
    // Return tickets with pending ones first, then recent within each group
    const tickets = await Ticket.find().sort({ status: 1, createdAt: -1 });
    res.json({ count: tickets.length, tickets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN - Respond to a ticket
const respondToTicket = async (req, res) => {
  try {
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({ error: "Response message is required" });
    }

    // When an admin/librarian responds, mark the ticket as resolved.
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        adminResponse: response,
        respondedBy: req.user.userId,
        respondedByName: req.user.fullName || req.user.fullname || null,
        status: "resolved",
      },
      { new: true },
    );

    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    res.json({ message: "Response sent", ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { raiseTicket, getMyTickets, getAllTickets, respondToTicket };
