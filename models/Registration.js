const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expo', required: true },
  sessionIds: [{ type: String }], // Array of session titles or IDs
  status: { type: String, enum: ['registered', 'attended', 'cancelled'], default: 'registered' }
}, { timestamps: true });


const Registration = mongoose.model("Registration", registrationSchema);
module.exports = Registration;

