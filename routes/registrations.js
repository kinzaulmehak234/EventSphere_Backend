const express = require('express');
const Registration  = require('../models/Registration');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

// Register for an expo
router.post('/register', authMiddleware, roleMiddleware(['attendee']), async (req, res) => {
  try {
    const { expoId, sessionIds } = req.body;
    const existing = await Registration.findOne({ userId: req.user.id, expoId });
    if (existing) {
      existing.sessionIds = sessionIds;
      await existing.save();
      return res.json(existing);
    }
    const registration = new Registration({ userId: req.user.id, expoId, sessionIds });
    await registration.save();
    res.status(201).json(registration);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user registrations
router.get('/my-registrations', authMiddleware, async (req, res) => {
  try {
    const registrations = await Registration.find({ userId: req.user.id }).populate('expoId');
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cancel/Delete registration
router.delete('/:id', authMiddleware, roleMiddleware(['attendee']), async (req, res) => {
  try {
    const registration = await Registration.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }
    res.json({ message: 'Registration cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
