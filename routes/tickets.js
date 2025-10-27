const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");
const { isLoggedIn, validateTicket, isOwner } = require("../middleware");

// Show all tickets
router.get("/", ticketController.index);

// New ticket form
router.get("/new", isLoggedIn, ticketController.renderNewForm);

// Create ticket
router.post("/", isLoggedIn, validateTicket, ticketController.createTicket);

// Show one ticket
router.get("/:id", ticketController.showTicket);

// Edit form
router.get("/:id/edit", isLoggedIn, isOwner, ticketController.renderEditForm);

// Update
router.put("/:id", isLoggedIn, isOwner, validateTicket, ticketController.updateTicket);

// Delete
router.delete("/:id", isLoggedIn, isOwner, ticketController.deleteTicket);

module.exports = router;
