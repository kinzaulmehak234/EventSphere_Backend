const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const expoRoutes = require('./routes/expos');
const boothRoutes = require('./routes/booths');
const exhibitorRoutes = require('./routes/exhibitors');
const scheduleRoutes = require('./routes/schedules');
const bookingRoutes = require('./routes/bookings');
const userRoutes = require('./routes/users');
const registrationRoutes = require('./routes/registrations');
const adminRoutes = require('./routes/admin');
const messageRoutes = require('./routes/messages');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eventsphere';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));


const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());


const Port = process.env.PORT || 5000;

app.use('/api/auth', authRoutes);
app.use('/api/expos', expoRoutes);
app.use('/api/booths', boothRoutes);
app.use('/api/exhibitors', exhibitorRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messages', messageRoutes);



const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('New socket connected:', socket.id);

  socket.on('user_online', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('online_users', Array.from(onlineUsers.keys()));
  });

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log('Joined room:', room);
  });

  socket.on('send_message', async (msg) => {
    const [userId1, userId2] = msg.room.split('_');
    const receiverId = msg.senderId === userId1 ? userId2 : userId1;

    const Message = require('./models/Message');
    const message = new Message({
      senderId: msg.senderId,
      receiverId,
      content: msg.content,
      image: msg.image, // Support image messages
    });
    await message.save();

    io.to(msg.room).emit('receive_message', message);
  });

  socket.on('typing', ({ room, userId, isTyping }) => {
    socket.to(room).emit('display_typing', { userId, isTyping });
  });

  socket.on('delete_message', async ({ room, messageId }) => {
    const Message = require('./models/Message');
    await Message.findByIdAndDelete(messageId);
    io.to(room).emit('message_deleted', { messageId });
  });

  socket.on('mark_read', async ({ room, userId }) => {
    const Message = require('./models/Message');
    const [id1, id2] = room.split('_');
    const senderId = id1 === userId ? id2 : id1;
    await Message.updateMany({ senderId, receiverId: userId, read: false }, { read: true });
    socket.to(room).emit('messages_read', { room });
  });

  socket.on('disconnect', () => {
    for (const [uid, sid] of onlineUsers.entries()) {
      if (sid === socket.id) { onlineUsers.delete(uid); break; }
    }
    io.emit('online_users', Array.from(onlineUsers.keys()));
    console.log('Socket disconnected:', socket.id);
  });
});

server.listen(Port, () => console.log(`Server is running http://localhost:${Port}`));
