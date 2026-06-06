if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingsRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// Environment Variables
const dbUrl = process.env.ATLASDB_URL;
const secret = process.env.SECRET ;

// ================== DB CONNECTION ==================
async function main() {
    if (!dbUrl) {
        console.error("Error: ATLASDB_URL is undefined. Check your .env file!");
        return;
    }
    await mongoose.connect(dbUrl);
    console.log("Connected to DB");
}

main().catch((err) => {
    console.log("Mongo Connection Error:", err);
});

// ================== APP CONFIG ==================
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ================== MIDDLEWARE ==================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ================== MONGO STORE & SESSION ==================
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: secret,
    },
    touchAfter: 24 * 3600, // seconds mein hota hai
});

store.on("error", (err) => {
    console.log("ERROR IN MONGO SESSION STORE", err);
});

const sessionOptions = {
    store: store,
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

// ================== PASSPORT CONFIG ==================
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ================== RES.LOCALS ==================
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// ================== ROUTES ==================
app.use("/listings", listingsRouter);
app.use("/listings/:listingId/reviews", reviewRouter);
app.use("/", userRouter);

// ================== ERROR HANDLING ==================
// 404 handler
app.use((req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

// Universal Error handler
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", {
        err: { statusCode, message }
    });
});

// ================== SERVER ==================
app.listen(8080, () => {
    console.log("Server running on port 8080");
});