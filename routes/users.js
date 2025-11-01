const express = require("express");
const router = express.Router();
const passport = require("passport");
const userController = require("../controllers/userController");

// Signup routes
router.get("/signup", userController.renderSignupForm);
router.post("/signup", userController.signupUser);

// Login routes
router.get("/login", userController.renderLoginForm);
router.post("/login", 
  (req, res, next) => {
    console.log("=== LOGIN ROUTE REACHED ===");
    console.log("Request body:", req.body);
    console.log("Username:", req.body.username);
    next();
  },
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/users/login"
    // Remove successRedirect to let Passport handle it properly
  }),
  // Custom success handler
  (req, res) => {
    console.log("=== AUTHENTICATION SUCCESS ===");
    console.log("User object:", req.user);
    if (req.user) {
      console.log("User logged in:", req.user.username, req.user.role);
      req.flash("success", "Welcome back!");
      
      // Explicitly save the session before redirecting
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          req.flash("error", "Login failed. Please try again.");
          return res.redirect("/users/login");
        }
        
        console.log("Session saved successfully");
        
        // Redirect to role-specific dashboards after login
        if (req.user.role === 'admin' || req.user.role === 'seller') {
          console.log("Redirecting seller/admin to /tickets/new");
          return res.redirect("/tickets/new");
        } else {
          console.log("Redirecting buyer to /tickets");
          return res.redirect("/tickets");
        }
      });
    } else {
      console.log("No user found in request");
      req.flash("error", "Login failed. Please try again.");
      return res.redirect("/users/login");
    }
  }
);

// Logout
router.get("/logout", userController.logoutUser);

module.exports = router;