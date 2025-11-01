const Ticket = require("./models/ticket");
const ExpressError = require("./utils/ExpressError");
const { ticketSchema } = require("./schema");

// Check if the user is logged in
module.exports.isLoggedIn = (req, res, next) => {
  console.log("=== isLoggedIn middleware called ===");
  console.log("User authenticated:", req.isAuthenticated());
  console.log("User object:", req.user);
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be logged in!");
    return res.redirect("/users/login");
  }
  console.log("User is logged in, proceeding to next middleware");
  next();
};

module.exports.isAdmin = (req, res, next) => {
  console.log("=== isAdmin middleware called ===");
  console.log("User object:", req.user);
  // For now, we'll consider users with role 'admin' or 'seller' as admins
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'seller')) {
    req.flash("error", "You don't have permission to access this page!");
    return res.redirect("/tickets");
  }
  console.log("User has admin/seller role, proceeding to next middleware");
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