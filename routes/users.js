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
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/users/login"
  }),
  userController.loginUser
);

// Logout
router.get("/logout", userController.logoutUser);

module.exports = router;
