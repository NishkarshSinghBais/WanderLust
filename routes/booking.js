const express = require("express");
const router = express.Router({ mergeParams: true });
const { isLoggedIn } = require("../middleware.js");
const bookingController = require("../controllers/booking.js");

// Show booking form
router.get("/:id/new", isLoggedIn, bookingController.renderNewBookingForm);

// Create Razorpay order
router.post("/:id/order", isLoggedIn, bookingController.createOrder);

// Verify payment + confirm booking
router.post("/verify", isLoggedIn, bookingController.verifyPayment);

module.exports = router;
