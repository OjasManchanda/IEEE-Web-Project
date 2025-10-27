const Ticket = require("../models/ticket");
const ExpressError = require("../utils/ExpressError");
const wrapAsync = require("../utils/wrapAsync");

// Show all tickets
module.exports.index = wrapAsync(async (req, res) => {
  const tickets = await Ticket.find({}).populate("owner");
  res.render("tickets/index", { tickets });
});

// Render new form
module.exports.renderNewForm = (req, res) => {
  res.render("tickets/new");
};

// Create new ticket
module.exports.createTicket = async (req, res) => {
  try {
    const ticket = new Ticket(req.body.ticket);
    ticket.owner = req.user._id; 
    await ticket.save();

    req.flash("success", "✅ Ticket created successfully!");
    
    res.redirect(`/tickets/${ticket._id}`);
  } catch (err) {
    req.flash("error", " Failed to create ticket. Please try again.");
    res.redirect("/tickets/new");
  }
};

// Show single ticket
module.exports.showTicket = async (req, res) => {
  const ticket = await Ticket.findById(req.params.id).populate("owner");
  if (!ticket) {
    req.flash("error", "Ticket not found!");
    return res.redirect("/tickets");
  }
  res.render("tickets/show", { ticket });
};


// Render edit form
module.exports.renderEditForm = wrapAsync(async (req, res) => {
  const { id } = req.params;
  const ticket = await Ticket.findById(id);
  if (!ticket) {
    req.flash("error", "Ticket not found!");
    return res.redirect("/tickets");
  }
  if (!ticket.owner.equals(req.user._id)) {
    req.flash("error", "You do not have permission to edit this ticket!");
    return res.redirect(`/tickets/${id}`);
  }
  res.render("tickets/edit", { ticket });
});

// Update ticket
module.exports.updateTicket = wrapAsync(async (req, res) => {
  const { id } = req.params;
  const ticket = await Ticket.findById(id);
  if (!ticket.owner.equals(req.user._id)) {
    req.flash("error", "You do not have permission to edit this ticket!");
    return res.redirect(`/tickets/${id}`);
  }

  const updatedTicket = await Ticket.findByIdAndUpdate(id, req.body.ticket, { new: true });
  req.flash("success", "Ticket updated successfully!");
  res.redirect(`/tickets/${updatedTicket._id}`);
});

// Delete ticket
module.exports.deleteTicket = wrapAsync(async (req, res) => {
  const { id } = req.params;
  const ticket = await Ticket.findById(id);
  if (!ticket.owner.equals(req.user._id)) {
    req.flash("error", "You do not have permission to delete this ticket!");
    return res.redirect(`/tickets/${id}`);
  }

  await Ticket.findByIdAndDelete(id);
  req.flash("success", "Ticket deleted successfully!");
  res.redirect("/tickets");
});
