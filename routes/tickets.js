const express = require("express");
const router = express.Router();
const { isLoggedIn, isAdmin } = require("../middleware");
const ticketController = require("../controllers/ticketController");

// All tickets
router.get("/", ticketController.index);

// Search tickets
router.get("/search", ticketController.searchTickets);

// New form
router.get("/new", isLoggedIn, ticketController.renderNewForm);

// Create ticket
router.post("/", isLoggedIn, ticketController.createTicket);

// Show ticket
router.get("/:id", ticketController.showTicket);

// Edit form
router.get("/:id/edit", isLoggedIn, ticketController.renderEditForm);

// Update ticket
router.put("/:id", isLoggedIn, ticketController.updateTicket);

// Delete ticket
router.delete("/:id", isLoggedIn, ticketController.deleteTicket);

// Book ticket
router.post("/:id/book", isLoggedIn, ticketController.bookTicket);

// Cancel ticket
router.post("/:id/cancel", isLoggedIn, ticketController.cancelTicket);

// Show confirmation
router.get("/:id/confirmation", isLoggedIn, ticketController.showConfirmation);

// Download ticket as PDF
router.get("/:id/download", isLoggedIn, ticketController.downloadTicket);

// My booked tickets
router.get("/my-tickets", isLoggedIn, ticketController.myBookedTickets);

// Admin dashboard
router.get("/admin/dashboard", isLoggedIn, isAdmin, ticketController.adminDashboard);

// QR scanner
router.get("/admin/qr-scanner", isLoggedIn, isAdmin, ticketController.qrScanner);

module.exports = router;