const express = require("express");
const router = express.Router({ mergeParams: true });
const { isLoggedIn } = require("../middleware.js");
const bookingController = require("../controllers/booking.js");

// Show booking form
router.get("/:id/new", isLoggedIn, bookingController.renderNewBookingForm);

// Handle booking submission
router.post("/:id", isLoggedIn, bookingController.createBooking);

module.exports = router;