const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ResultSchema = new Schema({
  appID_: String,
  result: String,
  LabEmail: String,
  TestName: String,
  Status: String,
});

var ResultModel = mongoose.model("ResultModel", ResultSchema);

module.exports.ResultModel = ResultModel;
