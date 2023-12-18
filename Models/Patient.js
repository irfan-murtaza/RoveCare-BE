const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var PatientSchema = new Schema({
  email: String,
  DOB: String,
});

var PatientModel = mongoose.model("PatientModel", PatientSchema);

module.exports.PatientModel = PatientModel;
