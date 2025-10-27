const Ticket = require("../models/ticket");

// Show all tickets
module.exports.index = async (req, res) => {
  const tickets = await Ticket.find({}).populate("owner");
  res.render("tickets/index", { tickets });
};

// Render form to add new ticket
module.exports.renderNewForm = (req, res) => {
  res.render("tickets/new");
};

// Create new ticket
module.exports.createTicket = async (req, res) => {
  const ticket = new Ticket(req.body.ticket);
  ticket.owner = req.user._id; // Set owner to logged-in user
  await ticket.save();
  req.flash("success", "Successfully created a new ticket!");
  res.redirect(`/tickets/${ticket._id}`);
};

// Show a specific ticket
module.exports.showTicket = async (req, res) => {
  const ticket = await Ticket.findById(req.params.id).populate("owner");
  if (!ticket) {
    req.flash("error", "Cannot find that ticket!");
    return res.redirect("/tickets");
  }
  res.render("tickets/show", { ticket });
};

// Render edit form
module.exports.renderEditForm = async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    req.flash("error", "Cannot find that ticket!");
    return res.redirect("/tickets");
  }
  res.render("tickets/edit", { ticket });
};

// Update ticket
module.exports.updateTicket = async (req, res) => {
  const { id } = req.params;
  const ticket = await Ticket.findByIdAndUpdate(id, { ...req.body.ticket });
  req.flash("success", "Successfully updated ticket!");
  res.redirect(`/tickets/${ticket._id}`);
};

// Delete ticket
module.exports.deleteTicket = async (req, res) => {
  const { id } = req.params;
  await Ticket.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted ticket!");
  res.redirect("/tickets");
};