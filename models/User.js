const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'exhibitor', 'attendee'], default: 'attendee' },
  profileInfo: {
    bio: String,
    phone: String,
    address: String,
    avatar: String,
    socialLinks: {
      linkedin: String,
      twitter: String,
      website: String
    }
  }
}, { timestamps: true });

// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// userSchema.methods.comparePassword = async function(candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

const User = mongoose.model('User', userSchema);
module.exports = User;
