const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var DoctorSchema = new Schema({
  email: String,
  address: String,
  fee: String,
  qual: String,
  spec: String,
  stat: String,
  reg: String,
});

var DoctorModel = mongoose.model("DoctorModel", DoctorSchema);

module.exports.DoctorModel = DoctorModel;
