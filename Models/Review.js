const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ReviewSchema = new Schema({
  Patient: String,
  Lab: String,
  Rating: String,
  Review: String,
});

var ReviewModel = mongoose.model("ReviewModel", ReviewSchema);

module.exports.ReviewModel = ReviewModel;
