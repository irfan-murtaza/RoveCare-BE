const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var AppointmentSchema = new Schema({
  ID_: String,
  Doctor: String,
  Patient: String,
  Dname: String,
  Pname: String,
  Date: String,
  Status: String,
  Slot: String,
});

var AppointmentModel = mongoose.model("AppointmentModel", AppointmentSchema);

module.exports.AppointmentModel = AppointmentModel;
