const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var AdminSchema = new Schema({
  email: String,
  DOB: String,
});

var AdminModel = mongoose.model("AdminModel", AdminSchema);

module.exports.AdminModel = AdminModel;
