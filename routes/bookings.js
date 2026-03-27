const express = require('express');
const { Booking } = require('../models/Booking');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get my bookings
router.get('/me', authMiddleware, roleMiddleware(['attendee']), async (req, res) => {
  try {
    const bookings = await Booking.find({ attendeeId: req.user.id }).populate('expoId');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create booking
router.post('/', authMiddleware, roleMiddleware(['attendee']), async (req, res) => {
  try {
    const booking = new Booking({ ...req.body, attendeeId: req.user.id });
    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;

