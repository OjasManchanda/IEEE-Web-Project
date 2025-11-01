const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ticketSchema = new Schema({
  eventName: {
    type: String,
    required: true,
  },
  eventDate: {
    type: Date,
    required: true,
  },
  pricePerTicket: {
    type: Number,
    required: true,
  },
  ticketsAvailable: {
    type: Number,
    required: true,
    min: 1,
  },
  owner: {
    type: Schema.Types.ObjectId, 
    ref: "User",            
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  eventCategory: {
    type: String,
    enum: ["Concert", "Sports", "Theatre", "Festival", "Comedy", "Other"],
    default: "Other",
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // New fields for ticket booking and cancellation
  status: {
    type: String,
    enum: ["available", "booked", "cancelled"],
    default: "available"
  },
  bookedBy: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  bookingDate: {
    type: Date
  },
  qrCode: {
    type: String
  },
  bookingId: {
    type: String
  },
  // Dynamic pricing fields
  totalSeats: {
    type: Number,
    required: true
  },
  basePrice: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model("Ticket", ticketSchema);
