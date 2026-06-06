const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware.js");
const userController = require("../controllers/user.js");

// ================= SIGNUP ROUTES =================
router
.route("/signup")
.get( userController.renderSignupForm)
.post(wrapAsync(userController.signup));

// ================= LOGIN ROUTES =================
router.route("/login")
.get( userController.login)
.post(
  saveRedirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.handleLogin
);

// ================= LOGOUT ROUTE =================
router.get("/logout", userController.logout);

module.exports = router;