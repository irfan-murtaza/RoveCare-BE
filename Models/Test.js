const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var TestSchema = new Schema({
  Lab: String,
  LabName: String,
  TestName: String,
  Price: String,
});

var TestModel = mongoose.model("TestModel", TestSchema);

module.exports.TestModel = TestModel;
