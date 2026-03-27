const express = require('express');
const  User  = require('../models/User');
const  Expo  = require('../models/Expo');
const  Booking  = require('../models/Booking');
const  Booth  = require('../models/Booth');
const  Message  = require('../models/Message');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    // Overview Stats
    const totalUsers = await User.countDocuments();
    const totalExpos = await Expo.countDocuments();
    const totalExhibitors = await User.countDocuments({ role: 'exhibitor' });
    const totalAttendees = await User.countDocuments({ role: 'attendee' });
    const totalBookings = await Booking.countDocuments();
    const totalBooths = await Booth.countDocuments();
    const occupiedBooths = await Booth.countDocuments({ status: 'occupied' });

    // Recent Activity
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('-password');
    const recentExpos = await Expo.find().sort({ createdAt: -1 }).limit(5);
    const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(5).populate('attendeeId', 'name email').populate('sessionId');
    const recentMessages = await Message.find().sort({ createdAt: -1 }).limit(5).populate('senderId', 'name');

    // Analytics
    const exposByTheme = await Expo.aggregate([
      { $group: { _id: '$theme', count: { $sum: 1 } } }
    ]);

    const now = new Date();
    const upcomingExpos = await Expo.countDocuments({ date: { $gte: now } });
    const pastExpos = await Expo.countDocuments({ date: { $lt: now } });

    // User Growth (last 6 months - simplified for now)
    const userGrowth = [
      { name: 'Jan', value: await User.countDocuments({ createdAt: { $lt: new Date('2026-02-01') } }) },
      { name: 'Feb', value: await User.countDocuments({ createdAt: { $lt: new Date('2026-03-01') } }) },
      { name: 'Mar', value: await User.countDocuments({ createdAt: { $lt: new Date('2026-04-01') } }) },
      { name: 'Apr', value: await User.countDocuments({ createdAt: { $lt: new Date('2026-05-01') } }) },
      { name: 'May', value: await User.countDocuments({ createdAt: { $lt: new Date('2026-06-01') } }) },
      { name: 'Jun', value: await User.countDocuments({ createdAt: { $lt: new Date('2026-07-01') } }) },
    ];

    res.json({
      overview: {
        totalUsers,
        totalExpos,
        totalExhibitors,
        totalAttendees,
        totalBookings,
        totalBooths,
        occupiedBooths,
        upcomingExpos,
        pastExpos
      },
      recent: {
        users: recentUsers,
        expos: recentExpos,
        bookings: recentBookings,
        messages: recentMessages
      },
      analytics: {
        exposByTheme,
        userGrowth
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;