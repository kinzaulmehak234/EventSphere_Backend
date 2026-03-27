const mongoose = require('mongoose');

const eventScheduleSchema = new mongoose.Schema({
  expoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expo', required: true },
  title: { type: String, required: true },
  speaker: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  location: { type: String },
  description: { type: String }
}, { timestamps: true });

const EventSchedule = mongoose.model("EventSchedule", eventScheduleSchema);
module.exports = EventSchedule;
