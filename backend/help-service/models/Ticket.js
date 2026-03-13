const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    raisedBy: {
      type: String,  // user ID from JWT
      required: true
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved'],
      default: 'open'
    },
    adminResponse: {
      type: String,
      default: null
    },
    respondedBy: {
      type: String,  // admin ID from JWT
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ticket', ticketSchema);