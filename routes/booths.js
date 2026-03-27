const express = require('express');
const  Booth  = require('../models/Booth');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get booths for an expo
router.get('/expo/:expoId', async (req, res) => {
  try {
    const booths = await Booth.find({ expoId: req.params.expoId }).populate('exhibitorId', 'name');
    res.json(booths);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get booths belonging to the logged in exhibitor
router.get('/my-booths', authMiddleware, roleMiddleware(['exhibitor']), async (req, res) => {
  try {
    const booths = await Booth.find({ exhibitorId: req.user.id }).populate('expoId', 'title date location');
    res.json(booths);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create booths (Admin only)
router.post('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const booth = new Booth(req.body);
    await booth.save();
    res.status(201).json(booth);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Book a booth (Exhibitor only)
router.post('/book/:id', authMiddleware, roleMiddleware(['exhibitor']), async (req, res) => {
  try {
    const booth = await Booth.findById(req.params.id);
    if (!booth || booth.status !== 'available') {
      return res.status(400).json({ message: 'Booth not available' });
    }
    booth.status = 'pending';
    booth.exhibitorId = req.user.id;
    await booth.save();
    res.json(booth);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cancel booth booking (Exhibitor only — pending booths only)
router.post('/cancel/:id', authMiddleware, roleMiddleware(['exhibitor']), async (req, res) => {
  try {
    const booth = await Booth.findById(req.params.id);
    if (!booth) return res.status(404).json({ message: 'Booth not found' });
    if (booth.status !== 'pending') return res.status(400).json({ message: 'Only pending bookings can be cancelled' });
    if (String(booth.exhibitorId) !== String(req.user.id)) return res.status(403).json({ message: 'Not your booking' });
    booth.status = 'available';
    booth.exhibitorId = null;
    await booth.save();
    res.json({ message: 'Booking cancelled', booth });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Approve booth booking (Admin only)
router.post('/approve/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const booth = await Booth.findById(req.params.id);
    if (!booth) return res.status(404).json({ message: 'Booth not found' });
    booth.status = 'occupied';
    await booth.save();
    res.json(booth);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update booth (Admin only)
router.put('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const booth = await Booth.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!booth) return res.status(404).json({ message: 'Booth not found' });
    res.json(booth);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete booth (Admin only)
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const booth = await Booth.findByIdAndDelete(req.params.id);
    if (!booth) return res.status(404).json({ message: 'Booth not found' });
    res.json({ message: 'Booth deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;