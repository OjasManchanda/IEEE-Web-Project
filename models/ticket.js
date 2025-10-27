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
    type: Schema.Types.ObjectId,  // ✅ Changed from String
    ref: "User",                   // ✅ Reference User model
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
});

module.exports = mongoose.model("Ticket", ticketSchema);
