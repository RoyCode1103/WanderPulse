const Joi = require("joi");

// ================= LISTING SCHEMA =================
module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required().min(0),
    location: Joi.string().required(),
    country: Joi.string().required(),
    image: Joi.string().allow("", null), // Image ko allow karna zaroori hai
    
    // ⭐ CATEGORY VALIDATION ADDED HERE
    category: Joi.string().valid(
      "trending", 
      "rooms", 
      "iconic-cities", 
      "mountains", 
      "castles", 
      "amazing-pools", 
      "camping", 
      "farms", 
      "arctic"
    ).required() 
  }).required(),
});

// ================= REVIEW SCHEMA =================
module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().required()
  }).required(),
});