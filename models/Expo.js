const mongoose = require('mongoose');


const expoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  theme: { type: String },
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed'], default: 'upcoming' },
  organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  images: [{ type: String }],
  exhibitors: [{
    name: { type: String },
    logo: { type: String },
    description: { type: String },
    website: { type: String }
  }],
  sessions: [{
    title: { type: String },
    time: { type: String },
    speaker: { type: String },
    description: { type: String }
  }]
}, { timestamps: true });

const Expo = mongoose.model('Expo', expoSchema);
module.exports = Expo;
