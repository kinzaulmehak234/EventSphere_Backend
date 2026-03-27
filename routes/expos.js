const express = require('express');
const  Expo  = require('../models/Expo');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all expos
router.get('/', async (req, res) => {
  try {
    const expos = await Expo.find().populate('organizerId', 'name');
    res.json(expos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create expo (Admin only)
router.post('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const expo = new Expo({ ...req.body, organizerId: req.user.id });
    await expo.save();
    res.status(201).json(expo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.get('/:id', async (req, res) => {
  try {
    const expo = await Expo.findById(req.params.id).populate('organizerId', 'name');
    if (!expo) return res.status(404).json({ message: 'Expo not found' });
    res.json(expo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update expo (Admin only)
router.put('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const expo = await Expo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(expo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete expo (Admin only)
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    await Expo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expo deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Add session to expo
router.post('/:id/sessions', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const expo = await Expo.findById(req.params.id);
    if (!expo) return res.status(404).json({ message: 'Expo not found' });
    expo.sessions.push(req.body);
    await expo.save();
    res.json(expo.sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update session in expo
router.put('/:id/sessions/:sessionId', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const expo = await Expo.findById(req.params.id);
    if (!expo) return res.status(404).json({ message: 'Expo not found' });
    const session = expo.sessions.id(req.params.sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    Object.assign(session, req.body);
    await expo.save();
    res.json(expo.sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete session from expo
router.delete('/:id/sessions/:sessionId', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const expo = await Expo.findById(req.params.id);
    if (!expo) return res.status(404).json({ message: 'Expo not found' });
    expo.sessions.pull(req.params.sessionId);
    await expo.save();
    res.json(expo.sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

