const User = require("../models/user.js");

// Render signup form
module.exports.renderSignupForm = async (req, res) => {
  res.render("users/signup.ejs");
};

// Handle user signup
module.exports.signup = async (req, res, next) => {
  try {
    // Correct destructuring of req.body
    const { username, email, password } = req.body;

    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);

    console.log(registeredUser);

    // Log the user in immediately after signup
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Wanderlust!");
      // Fallback to /listings if redirectUrl not set
      res.redirect(res.locals.redirectUrl || "/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

// Render login form
module.exports.login = async (req, res) => {
  res.render("users/login.ejs");
};

// Handle login POST
module.exports.handleLogin = async (req, res) => {
  req.flash("success", "Welcome back to Wanderlust!");
  // Fallback to /listings if redirectUrl not set
  res.redirect(res.locals.redirectUrl || "/listings");
};

// Handle logout
module.exports.logout = async (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
};