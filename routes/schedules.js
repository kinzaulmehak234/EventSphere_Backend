const express = require('express');
const  EventSchedule  = require('../models/EventSchedule');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get schedule for an expo
router.get('/expo/:expoId', async (req, res) => {
  try {
    const sessions = await EventSchedule.find({ expoId: req.params.expoId });
    res.json({ sessions }); // Keep sessions array format for frontend compatibility if possible
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add session to schedule (Admin only)
router.post('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const session = new EventSchedule(req.body);
    await session.save();
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update session (Admin only)
router.put('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const session = await EventSchedule.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete session (Admin only)
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const session = await EventSchedule.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json({ message: 'Session deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

