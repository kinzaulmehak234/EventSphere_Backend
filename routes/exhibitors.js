const express = require('express');
const  ExhibitorProfile  = require('../models/ExhibitorProfile');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all exhibitor profiles
router.get('/', async (req, res) => {
  try {
    const profiles = await ExhibitorProfile.find().populate('userId', 'name email');
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my profile
router.get('/me', authMiddleware, roleMiddleware(['exhibitor']), async (req, res) => {
  try {
    const profile = await ExhibitorProfile.findOne({ userId: req.user.id });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create/Update profile
router.post('/', authMiddleware, roleMiddleware(['exhibitor']), async (req, res) => {
  try {
    let profile = await ExhibitorProfile.findOne({ userId: req.user.id });
    if (profile) {
      profile = await ExhibitorProfile.findOneAndUpdate({ userId: req.user.id }, req.body, { new: true });
    } else {
      profile = new ExhibitorProfile({ ...req.body, userId: req.user.id });
      await profile.save();
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Approve profile (Admin only)
router.post('/approve/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const profile = await ExhibitorProfile.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete exhibitor (Admin only)
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const profile = await ExhibitorProfile.findByIdAndDelete(req.params.id);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json({ message: 'Exhibitor deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;