const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");
const ticketController = require("../controllers/ticketController");

// All tickets
router.get("/", ticketController.index);

// New form
router.get("/new", isLoggedIn, ticketController.renderNewForm);

// Create ticket
router.post("/", isLoggedIn, ticketController.createTicket);

// Show ticket
router.get("/:id", wrapAsync(ticketController.showTicket));

// Edit form
router.get("/:id/edit", isLoggedIn, ticketController.renderEditForm);

// Update ticket
router.put("/:id", isLoggedIn, ticketController.updateTicket);

// Delete ticket
router.delete("/:id", isLoggedIn, ticketController.deleteTicket);

module.exports = router;
