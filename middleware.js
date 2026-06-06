const Listing = require("./models/listing");
const Review = require("./models/review"); 
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

// ================= LOGIN CHECK =================
module.exports.isLoggedIn = (action) => {
  return (req, res, next) => {

    if (!req.isAuthenticated()) {
      req.session.redirectUrl = req.originalUrl;
      req.flash("error", `You must be logged in to ${action}!`);
      return res.redirect("/login");
    }

    next();
  };
};

// ================= OWNER CHECK =================
module.exports.isOwner = async (req, res, next) => {

  if (!req.user) {
    req.flash("error", "You must be logged in!");
    return res.redirect("/login");
  }

  const { id } = req.params;

  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You are not the owner of this listing!");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

// ================= LISTING VALIDATION =================
module.exports.validateListing = (req, res, next) => {

  const { error } = listingSchema.validate(req.body);

  if (error) {
    const errMsg = error.details.map(el => el.message).join(",");
    throw new ExpressError(errMsg, 400);
  }

  next();
};

// ================= REVIEW VALIDATION =================
module.exports.validateReview = (req, res, next) => {

  const { error } = reviewSchema.validate(req.body);

  if (error) {
    const errMsg = error.details.map(el => el.message).join(",");
    throw new ExpressError(errMsg, 400);
  }

  next();
};

// ================= SAVE REDIRECT URL =================
// middleware.js me saveRedirectUrl
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl && req.session.redirectUrl.startsWith("/listings")) {
    res.locals.redirectUrl = req.session.redirectUrl;
  } else {
    res.locals.redirectUrl = "/listings"; // default fallback
  }
  delete req.session.redirectUrl;
  next();
};

// ================= REVIEW AUTHOR CHECK =================
module.exports.isReviewAuthor = async (req, res, next) => {
  if (!req.user) {
    req.flash("error", "You must be logged in!");
    return res.redirect("/login");
  }

  const { id, reviewId } = req.params;

  const review = await Review.findById(reviewId);

  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You are not the author of this review!");
    return res.redirect(`/listings/${id}`);
  }

  next();
};