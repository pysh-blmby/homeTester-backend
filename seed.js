import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';

import User from './src/models/User.js';
import Lab from './src/models/Lab.js';
import Test from './src/models/Test.js';
import Booking from './src/models/Booking.js';
import Review from './src/models/Review.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hometester');
    console.log('MongoDB Connected for Seeding');

    // Clear existing data
    await User.deleteMany({});
    await Lab.deleteMany({});
    await Test.deleteMany({});
    await Booking.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing data');

    // Create known users for testing
    const patientUser = await User.create({
      phone: '1234567890',
      role: 'patient',
      name: 'Demo Patient',
      age: 30,
      gender: 'Male',
      address: '123 Test St',
      city: 'Mumbai',
      pincode: '400001'
    });

    const labOwnerUser = await User.create({
      phone: '0987654321',
      role: 'lab_owner',
      name: 'Demo Lab Owner',
      age: 45,
      gender: 'Female',
      address: '456 Lab Avenue',
      city: 'Delhi',
      pincode: '110001'
    });

    console.log('Created demo users (Phone: 1234567890 & 0987654321)');

    // Generate Users
    const users = [];
    const usedPhones = new Set(['1234567890', '0987654321']);
    
    for (let i = 0; i < 1000; i++) {
      let phone;
      do {
        phone = faker.phone.number({ style: 'national' }).replace(/\D/g, '').substring(0, 10);
      } while (usedPhones.has(phone) || phone.length !== 10);
      usedPhones.add(phone);

      users.push({
        phone,
        role: 'patient',
        name: faker.person.fullName(),
        age: faker.number.int({ min: 18, max: 80 }),
        gender: faker.helpers.arrayElement(['Male', 'Female', 'Other']),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        pincode: faker.location.zipCode('######'),
        createdAt: faker.date.past({ years: 1 })
      });
    }
    const insertedUsers = await User.insertMany(users);
    console.log(`Created ${insertedUsers.length} patients`);
    insertedUsers.push(patientUser);

    // Generate Labs
    const labs = [];
    const indianLabNames = ['HealthPlus Diagnostics', 'CarePath Labs', 'MediTrust Diagnostics', 'LifeCare Labs', 'Accurate Diagnostics', 'Apollo Diagnostics', 'Dr. Lal PathLabs', 'Thyrocare', 'SRL Diagnostics', 'Metropolis Healthcare', 'Vijaya Diagnostic', 'Max Lab', 'Suburban Diagnostics', 'Lucid Medical Diagnostics', 'Aarthi Scans and Labs', 'Nidan Diagnostics', 'Dr. Reddy Labs', 'Quest Diagnostics', 'Chazhikattu Hospital Labs', 'Krsnaa Diagnostics', 'Ampath Labs', 'Pathkind Labs', 'Neuberg Diagnostics'];
    
    for (let i = 0; i < 20; i++) {
      let ownerId = i === 0 ? labOwnerUser._id : faker.helpers.arrayElement(insertedUsers)._id;
      
      labs.push({
        ownerId,
        labName: indianLabNames[i % indianLabNames.length],
        ownerName: faker.person.fullName(),
        phone: faker.phone.number({ style: 'national' }).replace(/\D/g, '').substring(0, 10),
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        pincode: faker.location.zipCode('######'),
        operatingTimings: { open: '08:00 AM', close: '08:00 PM' },
        homeCollectionAvailable: faker.datatype.boolean(),
        description: faker.company.catchPhrase(),
        status: 'Approved',
        rating: faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }),
        reviewCount: faker.number.int({ min: 10, max: 500 }),
        createdAt: faker.date.past({ years: 1 })
      });
    }
    const insertedLabs = await Lab.insertMany(labs);
    console.log(`Created ${insertedLabs.length} labs`);

    // Generate Tests
    const tests = [];
    const categories = ['Blood', 'Urine', 'Full Body', 'Diabetes', 'Thyroid', 'Heart'];
    const testNames = ['CBC', 'Lipid Profile', 'Thyroid Profile', 'Vitamin D', 'Liver Function Test', 'Kidney Function Test', 'Blood Sugar', 'HbA1c', 'Covid RT-PCR', 'Urine Test', 'Dengue Test', 'Full Body Checkup'];
    
    for (const lab of insertedLabs) {
      const numTests = faker.number.int({ min: 5, max: 15 });
      for (let i = 0; i < numTests; i++) {
        const originalPrice = faker.number.int({ min: 500, max: 3000 });
        tests.push({
          labId: lab._id,
          testName: faker.helpers.arrayElement(testNames) + (i > 0 ? ` (Type ${i+1})` : ''),
          originalPrice,
          discountedPrice: Math.floor(originalPrice * faker.number.float({ min: 0.6, max: 0.9 })),
          description: faker.lorem.sentence(),
          fastingRequired: faker.datatype.boolean(),
          reportDeliveryTime: faker.helpers.arrayElement(['12 Hours', '24 Hours', '48 Hours']),
          homeCollectionAvailable: lab.homeCollectionAvailable,
          category: faker.helpers.arrayElement(categories)
        });
      }
    }
    const insertedTests = await Test.insertMany(tests);
    console.log(`Created ${insertedTests.length} tests`);

    // Generate Bookings
    const bookings = [];
    const statuses = ['Pending', 'Confirmed', 'Sample Collected', 'Processing', 'Report Uploaded', 'Completed', 'Cancelled'];
    
    for (let i = 0; i < 3000; i++) {
      const randomUser = faker.helpers.arrayElement(insertedUsers);
      const randomTest = faker.helpers.arrayElement(insertedTests);
      const slotDate = faker.date.recent({ days: 180 }); // Bookings from past 6 months
      
      let status;
      if (slotDate < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        status = faker.helpers.arrayElement(['Completed', 'Completed', 'Completed', 'Cancelled']);
      } else {
        status = faker.helpers.arrayElement(statuses);
      }

      bookings.push({
        patientId: randomUser._id,
        labId: randomTest.labId,
        tests: [randomTest._id],
        patientDetails: {
          fullName: randomUser.name || faker.person.fullName(),
          age: randomUser.age || faker.number.int({ min: 18, max: 80 }),
          gender: randomUser.gender || 'Male',
          phone: randomUser.phone,
          address: randomUser.address || faker.location.streetAddress()
        },
        slot: slotDate,
        status,
        paymentStatus: status === 'Cancelled' ? 'Pending' : faker.helpers.arrayElement(['Completed', 'Completed', 'Pending']),
        amountPaid: randomTest.discountedPrice,
        reportUrl: ['Completed', 'Report Uploaded'].includes(status) ? 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' : null,
        createdAt: slotDate,
        updatedAt: slotDate
      });
    }
    const insertedBookings = await Booking.insertMany(bookings);
    console.log(`Created ${insertedBookings.length} bookings`);

    // Generate Reviews
    const reviews = [];
    const completedBookings = insertedBookings.filter(b => b.status === 'Completed');
    
    for (let i = 0; i < Math.min(1000, completedBookings.length); i++) {
      const booking = completedBookings[i];
      if (faker.datatype.boolean()) { // 50% chance to leave a review
        reviews.push({
          patientId: booking.patientId,
          labId: booking.labId,
          bookingId: booking._id,
          rating: faker.number.int({ min: 3, max: 5 }), // mostly good reviews
          comment: faker.lorem.sentences({ min: 1, max: 3 }),
          createdAt: new Date(booking.slot.getTime() + 2 * 24 * 60 * 60 * 1000) // reviewed 2 days after booking
        });
      }
    }
    if (reviews.length > 0) {
      const insertedReviews = await Review.insertMany(reviews);
      console.log(`Created ${insertedReviews.length} reviews`);
    }

    console.log('Seeding Complete! 🎉');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();
