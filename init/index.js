require('dotenv').config({ path: "../.env" });
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const data = require("./data.js");

const dbUrl = process.env.ATLASDB_URL;

const OWNER_ID = new mongoose.Types.ObjectId("69a30443065186f409b2f389");
const OWNER_USERNAME = "Devil";
const OWNER_EMAIL = "devil@123gmail.com";

async function initDB() {
  try {
    if (!dbUrl) {
      throw new Error("ATLASDB_URL is not defined in .env file");
    }

    await mongoose.connect(dbUrl);
    console.log("Connected to MongoDB Atlas");

    // 🔹 Create user if not exists
    let user = await User.findById(OWNER_ID);

    if (!user) {
      user = new User({
        _id: OWNER_ID,
        username: OWNER_USERNAME,
        email: OWNER_EMAIL,
      });

      await User.register(user, "password123");
      console.log("User 'devil' created in Atlas");
    } else {
      console.log("User 'devil' already exists in Atlas");
    }

    // 🔹 Delete old listings in Atlas
    await Listing.deleteMany({});
    console.log("Old listings deleted from Atlas");

    // 🔹 Add owner reference
    const listingsWithOwner = data.data.map((obj) => ({
      ...obj,
      owner: user._id, 
    }));

    // 🔹 Insert listings into Atlas
    await Listing.insertMany(listingsWithOwner);
    console.log("Real listings from data.js inserted into Atlas!");

    mongoose.connection.close();
  } catch (err) {
    console.error("Initialization Error:", err);
    mongoose.connection.close();
  }
}

initDB();