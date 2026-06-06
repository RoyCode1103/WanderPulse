const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, validateReview } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

// ================== POST ADD REVIEW ==================
router.post(
  "/",
  isLoggedIn("leave a review"),
  validateReview,
  wrapAsync(reviewController.postReview)
);

// ================== DELETE REVIEW ==================
router.delete(
  "/:reviewId",
  isLoggedIn("delete a review"),
  wrapAsync(reviewController.deleteReview)
);

module.exports = router;