const express = require("express"); 
const router = express.Router();
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});
const wrapAsync = require("../utils/wrapAsync");
const {
  isLoggedIn,
  isOwner,
  validateListing
} = require("../middleware.js");
const listingController = require("../controllers/listings.js");


// ================= ROUTES =================

//GET AND POST
router
.route("/")
.get(wrapAsync(listingController.index))
.post(
  isLoggedIn("create a listing"),
  upload.single("listing[image]"),  
  validateListing,
  wrapAsync(listingController.createListing)
);

// NEW ROUTE
router.get("/new", isLoggedIn("create a new listing"), listingController.renderNewForm);

router
.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(
  isLoggedIn("update this listing"),
  isOwner,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.updateListing)
)
.delete(isLoggedIn("delete this listing"),
  isOwner,
  wrapAsync(listingController.deleteListing)
);

// EDIT ROUTE 
router.get("/:id/edit",
  isLoggedIn("edit this listing"),
  isOwner,
  wrapAsync(listingController.editListing)
);


module.exports = router;