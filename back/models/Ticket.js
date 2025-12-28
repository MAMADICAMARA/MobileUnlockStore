// back/models/Ticket.js
const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  messages: [
    {
      sender: { type: String, enum: ['client', 'admin'], required: true },
      content: { type: String, required: true },
      date: { type: Date, default: Date.now },
    }
  ],
  status: {
    type: String,
    enum: ['Ouvert', 'Répondu', 'Fermé'],
    default: 'Ouvert',
  },
  lastUpdate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const Ticket = mongoose.model('Ticket', TicketSchema);
module.exports = Ticket;
