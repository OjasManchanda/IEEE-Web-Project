const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  price: { type: Number, required: true },
  date: { type: String, required: true },
  sellerEmail: { type: String, required: true },
  status: { type: String, default: 'available' } // available or sold
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
