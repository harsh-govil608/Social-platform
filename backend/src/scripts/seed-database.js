#!/usr/bin/env node
/**
 * Database Seeding Script
 * Seeds the database with sample data for development/testing
 *
 * Usage: node src/scripts/seed-database.js
 */

import 'dotenv/config';
import { connectDB } from '../lib/db.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Subscription from '../models/Subscription.js';
import { createStreamUser } from '../lib/stream.js';

const sampleUsers = [
  {
    fullName: 'Admin User',
    email: 'admin@socialplatform.com',
    password: 'Admin123!',
    role: 'admin',
    isOnboarded: true,
    nativeLanguage: 'English',
    learningLanguage: 'Spanish',
    bio: 'Platform administrator',
    location: 'San Francisco, CA',
    interests: ['Technology', 'Education', 'Languages'],
  },
  {
    fullName: 'John Doe',
    email: 'john@example.com',
    password: 'User123!',
    role: 'user',
    isOnboarded: true,
    nativeLanguage: 'English',
    learningLanguage: 'French',
    bio: 'Language enthusiast and software developer',
    location: 'New York, NY',
    interests: ['Programming', 'Travel', 'Reading'],
  },
  {
    fullName: 'Jane Smith',
    email: 'jane@example.com',
    password: 'User123!',
    role: 'user',
    isOnboarded: true,
    nativeLanguage: 'Spanish',
    learningLanguage: 'English',
    bio: 'Teacher and language learner',
    location: 'Madrid, Spain',
    interests: ['Teaching', 'Music', 'Cooking'],
  },
  {
    fullName: 'Mike Johnson',
    email: 'mike@example.com',
    password: 'User123!',
    role: 'user',
    isOnboarded: true,
    nativeLanguage: 'English',
    learningLanguage: 'Japanese',
    bio: 'Tech enthusiast learning Japanese',
    location: 'Seattle, WA',
    interests: ['Anime', 'Gaming', 'Technology'],
  },
  {
    fullName: 'Sarah Williams',
    email: 'sarah@example.com',
    password: 'User123!',
    role: 'user',
    isOnboarded: true,
    nativeLanguage: 'French',
    learningLanguage: 'German',
    bio: 'Polyglot and world traveler',
    location: 'Paris, France',
    interests: ['Travel', 'Photography', 'Food'],
  },
];

const samplePosts = [
  {
    content: 'Just completed my first language lesson! Excited to learn more. 🎉',
    visibility: 'public',
  },
  {
    content: 'Looking for language exchange partners. Anyone interested in practicing conversation?',
    visibility: 'public',
  },
  {
    content: 'Pro tip: Consistency is key in language learning. Practice a little bit every day!',
    visibility: 'public',
  },
  {
    content: 'Sharing my progress: 30 days of daily practice completed! 💪',
    visibility: 'friends',
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to database
    await connectDB();

    // Check if database already has data
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('⚠️  Database already contains users.');
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const answer = await new Promise((resolve) => {
        rl.question('Do you want to clear existing data and reseed? (yes/no): ', resolve);
      });

      rl.close();

      if (answer.toLowerCase() !== 'yes') {
        console.log('❌ Seeding cancelled.');
        process.exit(0);
      }

      // Clear existing data
      console.log('\n🗑️  Clearing existing data...');
      await User.deleteMany({});
      await Post.deleteMany({});
      await Subscription.deleteMany({});
      console.log('✅ Existing data cleared\n');
    }

    // Create users
    console.log('👤 Creating users...');
    const createdUsers = [];

    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);

      // Create Stream user
      try {
        await createStreamUser(user._id, user.fullName, user.profilePic);
      } catch (error) {
        console.log(`  ⚠️  Stream user creation skipped for ${user.email}`);
      }

      console.log(`  ✅ Created user: ${user.email}`);
    }

    // Create friendships
    console.log('\n👥 Creating friendships...');
    for (let i = 0; i < createdUsers.length; i++) {
      for (let j = i + 1; j < Math.min(i + 3, createdUsers.length); j++) {
        createdUsers[i].friends.push(createdUsers[j]._id);
        createdUsers[j].friends.push(createdUsers[i]._id);
      }
      await createdUsers[i].save();
    }
    console.log('  ✅ Friendships created');

    // Create posts
    console.log('\n📝 Creating posts...');
    for (let i = 0; i < samplePosts.length; i++) {
      const postData = {
        ...samplePosts[i],
        user: createdUsers[i % createdUsers.length]._id,
      };

      const post = new Post(postData);
      await post.save();

      // Add some likes
      const likeCount = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < likeCount; j++) {
        const randomUser = createdUsers[(i + j + 1) % createdUsers.length];
        if (!post.likes.includes(randomUser._id)) {
          post.likes.push(randomUser._id);
        }
      }

      // Add some comments
      if (Math.random() > 0.5) {
        const randomCommenter = createdUsers[(i + 1) % createdUsers.length];
        post.comments.push({
          user: randomCommenter._id,
          text: 'Great post! Keep up the good work!',
          createdAt: new Date(),
        });
      }

      await post.save();
      console.log(`  ✅ Created post by ${createdUsers[i % createdUsers.length].fullName}`);
    }

    // Create sample subscriptions
    console.log('\n💳 Creating subscriptions...');
    const subscription = new Subscription({
      userId: createdUsers[1]._id,
      planType: 'pro',
      status: 'active',
      stripeCustomerId: 'cus_sample',
      stripeSubscriptionId: 'sub_sample',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      amount: 999,
    });
    await subscription.save();
    console.log('  ✅ Created sample subscription');

    // Summary
    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Users created: ${createdUsers.length}`);
    console.log(`   Posts created: ${samplePosts.length}`);
    console.log(`   Subscriptions: 1`);
    console.log('\n🔐 Login credentials:');
    console.log('   Admin: admin@socialplatform.com / Admin123!');
    console.log('   User: john@example.com / User123!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
