const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var TimeSlotSchema = new Schema({
  email: String,
  slot: String,
  day: String,
});

var TimeSlotModel = mongoose.model("TimeSlotModel", TimeSlotSchema);

module.exports.TimeSlotModel = TimeSlotModel;

// New
