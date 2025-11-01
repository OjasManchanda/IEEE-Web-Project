const User = require("../models/user");
const passport = require("passport");

// Render signup form
module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup");
};


module.exports.signupUser = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body; 
    console.log("Registration attempt:", { username, email, role });
    
    const user = new User({ email, username, role }); 
    const registeredUser = await User.register(user, password);
    console.log("User registered successfully:", registeredUser.username, registeredUser.role);

    // Use passport's login method to log in the user
    req.login(registeredUser, (err) => {
      if (err) {
        console.error("Error logging in user after registration:", err);
        req.flash("error", "Registration successful, but login failed. Please try logging in.");
        return res.redirect("/users/login");
      }
      
      console.log("User logged in successfully:", req.user.username, req.user.role);
      req.flash("success", `Welcome to Event Ticket Marketplace, ${username}!`);
      
      // Redirect to role-specific dashboards
      if (req.user.role === 'admin' || req.user.role === 'seller') {
        console.log("Redirecting seller/admin to /tickets/new");
        res.redirect("/tickets/new");
      } else {
        console.log("Redirecting buyer to /tickets");
        res.redirect("/tickets");
      }
    });
  } catch (e) {
    console.error("Error during user registration:", e);
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
  console.log("Login function called");
  console.log("Full req.user object:", JSON.stringify(req.user, null, 2));
  console.log("User type:", typeof req.user);
  
  if (req.user) {
    console.log("User logged in:", req.user.username, req.user.role);
    console.log("Role type:", typeof req.user.role);
    console.log("Role value:", req.user.role);
    
    req.flash("success", "Welcome back!");
    
    // Redirect to role-specific dashboards after login
    if (req.user.role === 'admin' || req.user.role === 'seller') {
      const redirectUrl = req.session.returnTo || "/tickets/new";
      console.log("Redirecting seller/admin to", redirectUrl);
      delete req.session.returnTo;
      return res.redirect(redirectUrl);
    } else {
      const redirectUrl = req.session.returnTo || "/tickets";
      console.log("Redirecting buyer to", redirectUrl);
      delete req.session.returnTo;
      return res.redirect(redirectUrl);
    }
  } else {
    console.log("No user found in request");
    req.flash("error", "Login failed. Please try again.");
    return res.redirect("/users/login");
  }
};

// Logout
module.exports.logoutUser = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Logged out successfully!");
    res.redirect("/");
  });
};