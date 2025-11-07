import User from '../models/User.js';
import Post from '../models/Post.js';
import { AnalyticsEvent } from '../models/Analytics.js';
import Subscription from '../models/Subscription.js';

/**
 * Create database indexes for optimal query performance
 * Run this once after deployment
 */
export const createDatabaseIndexes = async () => {
  try {
    console.log('📊 Creating database indexes...');

    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ fullName: 'text', bio: 'text' });
    await User.collection.createIndex({ isOnline: 1 });
    await User.collection.createIndex({ lastSeen: -1 });
    await User.collection.createIndex({ role: 1, isActive: 1 });
    await User.collection.createIndex({ createdAt: -1 });
    console.log('✅ User indexes created');

    // Post indexes
    await Post.collection.createIndex({ user: 1, createdAt: -1 });
    await Post.collection.createIndex({ createdAt: -1 });
    await Post.collection.createIndex({ visibility: 1, createdAt: -1 });
    await Post.collection.createIndex({ 'likes': 1 });
    await Post.collection.createIndex({ content: 'text' });
    console.log('✅ Post indexes created');

    // Analytics indexes
    await AnalyticsEvent.collection.createIndex({ userId: 1, eventType: 1 });
    await AnalyticsEvent.collection.createIndex({ eventType: 1, timestamp: -1 });
    await AnalyticsEvent.collection.createIndex({ userId: 1, timestamp: -1 });
    await AnalyticsEvent.collection.createIndex({ timestamp: -1 });
    console.log('✅ Analytics indexes created');

    // Subscription indexes
    await Subscription.collection.createIndex({ userId: 1, status: 1 });
    await Subscription.collection.createIndex({ status: 1, currentPeriodEnd: 1 });
    await Subscription.collection.createIndex({ stripeCustomerId: 1 });
    await Subscription.collection.createIndex({ stripeSubscriptionId: 1 });
    console.log('✅ Subscription indexes created');

    console.log('✅ All database indexes created successfully\n');

    return true;
  } catch (error) {
    console.error('❌ Error creating database indexes:', error);
    throw error;
  }
};

/**
 * List all existing indexes for verification
 */
export const listIndexes = async () => {
  try {
    console.log('\n📋 Listing all indexes:\n');

    const userIndexes = await User.collection.indexes();
    console.log('User indexes:', userIndexes.map(i => i.name));

    const postIndexes = await Post.collection.indexes();
    console.log('Post indexes:', postIndexes.map(i => i.name));

    const analyticsIndexes = await AnalyticsEvent.collection.indexes();
    console.log('Analytics indexes:', analyticsIndexes.map(i => i.name));

    const subscriptionIndexes = await Subscription.collection.indexes();
    console.log('Subscription indexes:', subscriptionIndexes.map(i => i.name));

    console.log('\n');
  } catch (error) {
    console.error('Error listing indexes:', error);
  }
};

/**
 * Drop all custom indexes (use with caution)
 */
export const dropAllCustomIndexes = async () => {
  try {
    console.warn('⚠️  Dropping all custom indexes...');

    await User.collection.dropIndexes();
    await Post.collection.dropIndexes();
    await AnalyticsEvent.collection.dropIndexes();
    await Subscription.collection.dropIndexes();

    console.log('✅ All custom indexes dropped');
  } catch (error) {
    console.error('Error dropping indexes:', error);
    throw error;
  }
};

export default {
  createDatabaseIndexes,
  listIndexes,
  dropAllCustomIndexes,
};
