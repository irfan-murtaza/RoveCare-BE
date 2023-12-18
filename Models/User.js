const mongoose = require("mongoose");

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  email: String,
  password: String,
  name: String,
  contact: String,
  type: String,
});

var UserModel = mongoose.model("UserModel", UserSchema);

module.exports.UserModel = UserModel;
