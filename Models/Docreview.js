const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var DocReviewSchema = new Schema({
  AppointID: String,
  Docemail: String,
  Patient: String,
  Doctor: String,
  Rating: String,
  Review: String,
});

var DocReviewModel = mongoose.model("DocReviewModel", DocReviewSchema);

module.exports.DocReviewModel = DocReviewModel;
