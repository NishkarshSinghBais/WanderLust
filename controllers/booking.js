const Listing = require("../models/listing");
const Booking = require("../models/booking"); // you’ll need this model

module.exports.renderNewBookingForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  res.render("bookings/new", { listing });
};

module.exports.createBooking = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  const booking = new Booking(req.body.booking);
  booking.listing = listing._id;
  booking.user = req.user._id;
  await booking.save();

  req.flash("success", "Booking created successfully!");
  res.redirect(`/listings/${id}`);
};
