const Listing = require("../models/listing");
const Booking = require("../models/booking");
const razorpay = require("../utils/razorpay");
const crypto = require("crypto");

module.exports.renderNewBookingForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  res.render("bookings/new", { listing, key: process.env.RAZORPAY_KEY_ID });
};

// (A) Create Razorpay Order
module.exports.createOrder = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    return res.status(404).send("Listing not found");
  }

  const amount = listing.price * 100; // in paise
  const options = {
    amount,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json({ order, listing });
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    res.status(500).json({ success: false, message: "Could not create order" });
  }
};

// (B) Verify Payment + Save Booking
module.exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      listingId,
      bookingData,
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }

    // Save booking only after payment success
    const booking = new Booking(bookingData);
    booking.listing = listingId;
    booking.user = req.user._id;
    booking.paymentId = razorpay_payment_id;
    booking.orderId = razorpay_order_id;
    booking.status = "confirmed";

    await booking.save();

    req.flash("success", "Booking confirmed successfully!");
    res.json({ success: true, redirectUrl: `/listings/${listingId}` });
  } catch (err) {
    console.error("Error verifying Razorpay payment:", err);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong during payment verification" });
  }
};

