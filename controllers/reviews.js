const Listing = require("../models/listing.js");
const Review = require("../models/review.js");


module.exports.postReview=async (req, res) => {
    const { listingId } = req.params;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    const review = new Review(req.body.review);
    review.author = req.user._id;

    listing.reviews.push(review._id);

    await Promise.all([review.save(), listing.save()]);

    req.flash("success", "Created new review!");
    res.redirect(`/listings/${listingId}`);
  }

module.exports.deleteReview=async (req, res) => {
    const { listingId, reviewId } = req.params;

    // Remove review reference from Listing
    await Listing.findByIdAndUpdate(listingId, {
      $pull: { reviews: reviewId },
    });

    // Delete the review document
    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${listingId}`);
  }