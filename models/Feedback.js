const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expo', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String }
}, { timestamps: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedback;

