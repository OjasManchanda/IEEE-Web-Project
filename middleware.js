const Ticket = require("./models/ticket");
const ExpressError = require("./utils/ExpressError");
const { ticketSchema } = require("./schema");

// Check if the user is logged in
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in first!");
    return res.redirect("/users/login");
  }
  next();
};

// Validate ticket data before saving
module.exports.validateTicket = (req, res, next) => {
  const { error } = ticketSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(", ");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

// Check if the current user is the owner of the ticket
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const ticket = await Ticket.findById(id);
  if (!ticket.owner.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/tickets/${id}`);
  }
  next();
};