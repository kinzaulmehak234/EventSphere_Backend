
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  attendeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expo', required: true },
  sessionId: { type: String }, 
  status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' }
}, { timestamps: true });


const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
