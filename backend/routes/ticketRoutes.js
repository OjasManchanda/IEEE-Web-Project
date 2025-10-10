const express = require('express');
const router = express.Router();
const Ticket = require('../models/ticketModel');

// Add a ticket (seller)
router.post('/add', async (req, res) => {
  const { eventName, price, date, sellerEmail } = req.body;

  try {
    const ticket = new Ticket({ eventName, price, date, sellerEmail });
    await ticket.save();
    res.json({ message: 'Ticket added successfully', ticket });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all tickets (buyer view)
router.get('/all', async (req, res) => {
  try {
    const tickets = await Ticket.find({ status: 'available' });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update ticket (e.g., mark as sold)
router.put('/buy/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.status = 'sold';
    await ticket.save();
    res.json({ message: 'Ticket purchased successfully', ticket });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete ticket (seller)
router.delete('/delete/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    res.json({ message: 'Ticket deleted successfully', ticket });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
