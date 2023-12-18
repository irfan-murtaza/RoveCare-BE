const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var LabSchema = new Schema({
  email: String,
  address: String,
});

var LabModel = mongoose.model("LabModel", LabSchema);

module.exports.LabModel = LabModel;
