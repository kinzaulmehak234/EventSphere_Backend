const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

// Get all users the current user has chatted with + unread counts
router.get('/contacts', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    // Find all messages involving this user
    const msgs = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ createdAt: -1 });

    // Build a map of unique contact IDs, keeping the latest message per contact
    const contactMap = new Map(); // contactId -> { lastMsg, unread }
    for (const m of msgs) {
      const otherId = String(m.senderId) === userId ? String(m.receiverId) : String(m.senderId);
      if (!contactMap.has(otherId)) {
        contactMap.set(otherId, {
          lastMessage: m.content,
          lastMessageAt: m.createdAt,
          unread: 0,
        });
      }
      // Count unread messages sent to me
      if (String(m.receiverId) === userId && !m.read) {
        contactMap.get(otherId).unread += 1;
      }
    }

    // Fetch user info for each contact
    const contactIds = Array.from(contactMap.keys());
    const users = await User.find({ _id: { $in: contactIds } }).select('name email role');

    const contacts = users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      ...contactMap.get(String(u._id)),
    }));

    // Sort by lastMessageAt descending
    contacts.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

    res.json(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Get all users (for starting new conversations)
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select('name email role');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get message history between two users
router.get('/:chatId', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { chatId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: chatId },
        { senderId: chatId, receiverId: userId }
      ]
    }).sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany({ senderId: chatId, receiverId: userId, read: false }, { read: true });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Post a new message (REST fallback)
router.post('/', authMiddleware, async (req, res) => {
  const { receiverId, content } = req.body;
  try {
    const message = new Message({ senderId: req.user.id, receiverId, content });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;