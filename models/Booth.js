const mongoose = require('mongoose');

const boothSchema = new mongoose.Schema({
  expoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expo', required: true },
  boothNumber: { type: String, required: true },
  status: { type: String, enum: ['available', 'pending', 'occupied'], default: 'available' },
  exhibitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  price: { type: Number, default: 0 }
}, { timestamps: true });

const Booth = mongoose.model('Booth', boothSchema);
module.exports = Booth;
