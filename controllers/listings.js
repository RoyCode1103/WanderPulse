const Listing = require("../models/listing");

// ================= INDEX (ALL LISTINGS & SEARCH) =================
module.exports.index = async (req, res) => {
    let { category, q } = req.query;
    let filter = {};

    // Filter logic for category and search
    if (category) {
        filter = { category: category };
    } else if (q) {
        filter = {
            $or: [
                { title: { $regex: q, $options: "i" } },
                { location: { $regex: q, $options: "i" } },
                { country: { $regex: q, $options: "i" } }
            ]
        };
    }

    const listings = await Listing.find(filter);
    
    // ⭐ Data for search suggestions (Title, Location, Image)
    const allTitles = await Listing.find({}).select("title location country image.url");

    res.render("listings/index", { listings, category, q, allTitles }); 
};

// ================= RENDER NEW FORM =================
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new");
};

// ================= CREATE NEW LISTING =================
module.exports.createListing = async (req, res) => {
    const newListing = new Listing(req.body.listing);
    
    newListing.owner = req.user._id;

    // Image handling using (Cloudinary)
    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        newListing.image = { url, filename };
    }

    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

// ================= SHOW SINGLE LISTING =================
module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
                select: "username" 
            },
        })
        .populate("owner", "username");

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    res.render("listings/show", { listing });
};

// ================= RENDER EDIT FORM =================
module.exports.editListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    // Image preview resize logic
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    
    res.render("listings/edit", { listing, originalImageUrl });
};

// ================= UPDATE LISTING =================
module.exports.updateListing = async (req, res) => {
    const { id } = req.params;

    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });


    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

// ================= DELETE LISTING =================
module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};