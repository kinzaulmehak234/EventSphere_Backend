const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load models
const User = require('./models/User');
const Expo = require('./models/Expo');
const EventSchedule = require('./models/EventSchedule');
const Registration = require('./models/Registration');
const Booth = require('./models/Booth');
const ExhibitorProfile = require('./models/ExhibitorProfile');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eventsphere';

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');

    // Clear existing data
    console.log('Clearing existing database collections...');
    await Promise.all([
      User.deleteMany({}),
      Expo.deleteMany({}),
      EventSchedule.deleteMany({}),
      Registration.deleteMany({}),
      Booth.deleteMany({}),
      ExhibitorProfile.deleteMany({})
    ]);
    console.log('Old data cleared.');

    // 1. Create Users
    console.log('Creating users...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const usersData = [
      {
        name: 'Admin User',
        email: 'admin@eventsphere.com',
        password: hashedPassword,
        role: 'admin',
        profileInfo: { bio: 'System Administrator', phone: '+1234567890', address: '123 Tech Lane, NY' }
      },
      {
        name: 'TechCorp Exhibitor',
        email: 'exhibitor1@techcorp.com',
        password: hashedPassword,
        role: 'exhibitor',
        profileInfo: { bio: 'Leading technology solutions provider.', phone: '+1987654321', address: '456 Silicon Valley, CA' }
      },
      {
        name: 'InnoVate AI',
        email: 'exhibitor2@innovate.ai',
        password: hashedPassword,
        role: 'exhibitor',
        profileInfo: { bio: 'Innovating the future with AI.', phone: '+1122334455', address: '789 AI Park, TX' }
      },
      {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: hashedPassword,
        role: 'attendee',
        profileInfo: { bio: 'Software Engineer and tech enthusiast.', phone: '+1555555555', address: 'London, UK' }
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: hashedPassword,
        role: 'attendee',
        profileInfo: { bio: 'Product Manager looking for networking.', phone: '+1444444444', address: 'Berlin, DE' }
      }
    ];

    const createdUsers = await User.insertMany(usersData);
    const adminUser = createdUsers.find(u => u.role === 'admin');
    const exhibitor1 = createdUsers.find(u => u.email === 'exhibitor1@techcorp.com');
    const exhibitor2 = createdUsers.find(u => u.email === 'exhibitor2@innovate.ai');
    const attendee1 = createdUsers.find(u => u.email === 'john.doe@example.com');

    // 2. Create Expos
    console.log('Creating events (expos)...');

    // Future date
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const exposData = [
      {
        title: 'Global AI Summit 2026',
        date: nextMonth,
        location: 'Moscone Center, San Francisco, CA',
        description: 'Join the world\'s brightest minds in Artificial Intelligence. This 3-day event features keynote speeches from industry leaders, hands-on workshops, and over 200 exhibitors showcasing the latest AI products. Discover new trends in machine learning, neural networks, and generative AI.\n\nWhether you are a developer, researcher, or business leader, the Global AI Summit is the premier destination to connect with the AI community.',
        theme: 'Technology & AI',
        status: 'upcoming',
        organizerId: adminUser._id,
        images: [
          'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
          'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
        ],
        exhibitors: [
          {
            name: exhibitor2.name,
            logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80',
            description: exhibitor2.profileInfo.bio,
            website: 'https://innovate.ai'
          }
        ],
        sessions: [
          {
            title: 'The Future of Generative AI',
            time: '10:00 AM',
            speaker: 'Dr. Sarah Connor',
            description: 'A deep dive into how generative AI will shape content creation in the next decade.'
          },
          {
            title: 'Ethical AI Development',
            time: '01:00 PM',
            speaker: 'Marcus Aurelius',
            description: 'Discussing the frameworks needed to build unbiased and ethical AI systems.'
          }
        ]
      },
      {
        title: 'Web3 & Blockchain Expo',
        date: nextWeek,
        location: 'ExCeL London, UK',
        description: 'The ultimate gathering of blockchain enthusiasts, crypto investors, and Web3 developers. Experience the latest decentralized applications, smart contract platforms, and Metaverse innovations at the Web3 & Blockchain Expo.',
        theme: 'Blockchain',
        status: 'upcoming',
        organizerId: adminUser._id,
        images: [
          'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
          'https://images.unsplash.com/photo-1622630998477-20b41cd812f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
        ],
        exhibitors: [
          {
            name: exhibitor1.name,
            logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=200&q=80',
            description: 'Blockchain infrastructure and modern Web3 tools.',
            website: 'https://techcorp.com'
          }
        ],
        sessions: [
          {
            title: 'Building Scalable Smart Contracts',
            time: '09:30 AM',
            speaker: 'Vitalik Nakamoto',
            description: 'Learn the best practices for writing secure and efficient smart contracts.'
          }
        ]
      }
    ];

    const createdExpos = await Expo.insertMany(exposData);
    const aiSummit = createdExpos.find(e => e.title === 'Global AI Summit 2026');
    const web3Expo = createdExpos.find(e => e.title === 'Web3 & Blockchain Expo');

    // 3. Create Event Schedules
    console.log('Creating event schedules...');
    const schedulesData = [
      {
        expoId: aiSummit._id,
        title: 'The Future of Generative AI',
        speaker: 'Dr. Sarah Connor',
        startTime: new Date(nextMonth.setHours(10, 0, 0, 0)),
        endTime: new Date(nextMonth.setHours(11, 30, 0, 0)),
        location: 'Main Hall A',
        description: 'A deep dive into how generative AI will shape content creation in the next decade.'
      },
      {
        expoId: aiSummit._id,
        title: 'Ethical AI Development',
        speaker: 'Marcus Aurelius',
        startTime: new Date(nextMonth.setHours(13, 0, 0, 0)),
        endTime: new Date(nextMonth.setHours(14, 0, 0, 0)),
        location: 'Seminar Room 2',
        description: 'Discussing the frameworks needed to build unbiased and ethical AI systems.'
      },
      {
        expoId: web3Expo._id,
        title: 'Building Scalable Smart Contracts',
        speaker: 'Vitalik Nakamoto',
        startTime: new Date(nextWeek.setHours(9, 30, 0, 0)),
        endTime: new Date(nextWeek.setHours(10, 30, 0, 0)),
        location: 'Innovation Stage',
        description: 'Learn the best practices for writing secure and efficient smart contracts.'
      }
    ];
    await EventSchedule.insertMany(schedulesData);

    // 4. Create Booths
    console.log('Creating booths...');
    const boothsData = [
      // AI Summit Booths
      { expoId: aiSummit._id, boothNumber: 'A-101', status: 'occupied', exhibitorId: exhibitor2._id, price: 500 },
      { expoId: aiSummit._id, boothNumber: 'A-102', status: 'available', price: 500 },
      { expoId: aiSummit._id, boothNumber: 'A-103', status: 'available', price: 500 },
      { expoId: aiSummit._id, boothNumber: 'A-104', status: 'pending', exhibitorId: exhibitor1._id, price: 550 },
      { expoId: aiSummit._id, boothNumber: 'A-105', status: 'available', price: 550 },
      { expoId: aiSummit._id, boothNumber: 'B-201', status: 'available', price: 400 },
      { expoId: aiSummit._id, boothNumber: 'B-202', status: 'occupied', exhibitorId: exhibitor1._id, price: 400 },
      { expoId: aiSummit._id, boothNumber: 'B-203', status: 'available', price: 400 },

      // Web3 Expo Booths
      { expoId: web3Expo._id, boothNumber: 'W-01', status: 'occupied', exhibitorId: exhibitor1._id, price: 350 },
      { expoId: web3Expo._id, boothNumber: 'W-02', status: 'occupied', exhibitorId: exhibitor2._id, price: 380 },
      { expoId: web3Expo._id, boothNumber: 'W-03', status: 'pending', exhibitorId: exhibitor1._id, price: 350 },
      { expoId: web3Expo._id, boothNumber: 'W-04', status: 'available', price: 350 },
      { expoId: web3Expo._id, boothNumber: 'C-10', status: 'available', price: 250 },
      { expoId: web3Expo._id, boothNumber: 'C-11', status: 'available', price: 250 },
      { expoId: web3Expo._id, boothNumber: 'C-12', status: 'available', price: 250 },
    ];
    await Booth.insertMany(boothsData);

    // 5. Create Registrations
    console.log('Creating registrations...');
    const registrationsData = [
      {
        userId: attendee1._id,
        expoId: aiSummit._id,
        sessionIds: ['The Future of Generative AI'], // the frontend uses session.title
        status: 'registered'
      }
    ];
    await Registration.insertMany(registrationsData);

    // 6. Create Exhibitor Profiles
    console.log('Creating exhibitor profiles...');
    const exhibitorProfilesData = [
      {
        userId: exhibitor1._id,
        companyName: 'TechCorp Solutions',
        description: exhibitor1.profileInfo.bio,
        logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=200&q=80',
        website: 'https://techcorp.com',
        status: 'approved'
      },
      {
        userId: exhibitor2._id,
        companyName: 'InnoVate AI',
        description: exhibitor2.profileInfo.bio,
        logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=200&q=80',
        website: 'https://innovate.ai',
        status: 'approved'
      },
      {
        userId: exhibitor1._id, // Just reusing the user ID for dummy data
        companyName: 'NextGen Robotics',
        description: 'Building the next generation of autonomous and remote-controlled robotic systems.',
        logo: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=200&q=80',
        website: 'https://nextgenrobotics.inc',
        status: 'approved'
      },
      {
        userId: exhibitor2._id,
        companyName: 'Quantum Computing Ltd.',
        description: 'Pioneering quantum algorithms for the future of processing.',
        logo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=200&q=80',
        website: 'https://quantum-ltd.io',
        status: 'pending'
      }
    ];
    await ExhibitorProfile.insertMany(exhibitorProfilesData);

    console.log('\n======================================');
    console.log('Database seeded successfully! 🌱');
    console.log('Admin Login: admin@eventsphere.com / password123');
    console.log('Exhibitor Login: exhibitor1@techcorp.com / password123');
    console.log('Attendee Login: john.doe@example.com / password123');
    console.log('======================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding the database: ', error);
    process.exit(1);
  }
};

seedData();

seedData();
