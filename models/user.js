const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ["buyer", "seller"],
    default: "buyer"
  }
});

userSchema.plugin(passportLocalMongoose); // Adds username, hash, salt automatically

module.exports = mongoose.model("User", userSchema);