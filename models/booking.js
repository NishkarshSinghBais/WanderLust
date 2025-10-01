const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  checkIn: Date,
  checkOut: Date,
  guests: Number,
  user: { type: Schema.Types.ObjectId, ref: "User" },
  listing: { type: Schema.Types.ObjectId, ref: "Listing" }
});

module.exports = mongoose.model("Booking", bookingSchema);
