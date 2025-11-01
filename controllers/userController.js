const User = require("../models/user");
const passport = require("passport");

// Render signup form
module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup");
};


module.exports.signupUser = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body; 
    const user = new User({ email, username, role }); 
    const registeredUser = await User.register(user, password);

    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", `Welcome to Event Ticket Marketplace, ${username}!`);
      res.redirect("/tickets");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/users/signup");
  }
};


// Render login form
module.exports.renderLoginForm = (req, res) => {
  res.render("users/login");
};

// Handle login
module.exports.loginUser = (req, res) => {
  req.flash("success", "Welcome back!");
  const redirectUrl = req.session.returnTo || "/tickets";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

// Logout
module.exports.logoutUser = (req, res, next) => {
  req.logout((err) => {
    if (err)  {
      return next(err);
    }
    req.flash("success", "Logged out successfully!");
    res.redirect("/");
  });
};