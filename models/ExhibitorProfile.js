const mongoose = require('mongoose');

const exhibitorProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true },
  description: { type: String },
  logo: { type: String },
  website: { type: String },
  industry: { type: String },
  phone: { type: String },
  email: { type: String },
  products: [{
    name: String,
    description: String,
    image: String
  }],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

const ExhibitorProfile = mongoose.model("ExhibitorProfile", exhibitorProfileSchema);
module.exports = ExhibitorProfile;
