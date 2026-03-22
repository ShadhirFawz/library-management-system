const Ticket = require("../models/Ticket");

// USER - Raise a new ticket
const raiseTicket = async (req, res) => {
  try {
    const { subject, description } = req.body;

    if (!subject || !description) {
      return res
        .status(400)
        .json({ error: "Subject and description are required" });
    }

    const raisedById =
      req.user?.userId || req.user?.userId || req.user?.id || req.user?.id;
    const raisedByName =
      req.user?.fullName || req.user?.user?.fullName || req.user?.name || null;

    const ticket = await Ticket.create({
      subject,
      description,
      raisedBy: raisedById,
      raisedByName,
    });

    res.status(201).json({ message: "Ticket raised successfully", ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// USER - View own tickets
const getMyTickets = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const tickets = await Ticket.find({ raisedBy: userId }).sort({
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
      return res.status(400).json({ error: "Response message is required" });
    }

    const allowedStatus = ["pending", "resolved"];
    if (status && !allowedStatus.includes(status)) {
      return res
        .status(400)
        .json({ error: `Status must be one of ${allowedStatus.join(", ")}` });
    }

    const respondedById = req.user?.userId || req.user?.id;
    const respondedByName =
      req.user?.fullName || req.user?.user?.fullName || null;

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        adminResponse: response,
        respondedBy: respondedById,
        respondedByName,
        status: status || "resolved",
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
