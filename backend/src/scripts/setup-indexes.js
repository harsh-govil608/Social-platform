#!/usr/bin/env node
/**
 * Script to create database indexes
 * Run with: node src/scripts/setup-indexes.js
 */

import 'dotenv/config';
import { connectDB } from '../lib/db.js';
import { createDatabaseIndexes, listIndexes } from '../lib/dbIndexes.js';

const setupIndexes = async () => {
  try {
    console.log('🚀 Starting index setup...\n');

    // Connect to database
    await connectDB();

    // Create indexes
    await createDatabaseIndexes();

    // List all indexes for verification
    await listIndexes();

    console.log('✅ Index setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up indexes:', error);
    process.exit(1);
  }
};

setupIndexes();
