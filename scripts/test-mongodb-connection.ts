#!/usr/bin/env tsx
/**
 * Test script to verify MongoDB connection
 * Usage: tsx scripts/test-mongodb-connection.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔍 Testing MongoDB connection...\n');

// Check if environment variable is set
if (!MONGODB_URI) {
  console.error('❌ ERROR: Missing MONGODB_URI environment variable!');
  console.error('   Please set MONGODB_URI in .env.local');
  console.error('   Example: MONGODB_URI=mongodb://localhost:27017/reality-estate');
  console.error('   Or: MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname');
  process.exit(1);
}

// Check for placeholder values
if (MONGODB_URI.includes('placeholder')) {
  console.error('❌ ERROR: Using placeholder MongoDB URI');
  console.error('   Please set a valid MONGODB_URI in .env.local');
  process.exit(1);
}

console.log('✅ Environment variable is set');
console.log(`   URI: ${MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}\n`);

// Test connection
async function testConnection() {
  try {
    console.log('🔄 Connecting to MongoDB...');

    await mongoose.connect(MONGODB_URI!);

    console.log('✅ MongoDB connection successful!');

    // Test database operations
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    const collections = await db.listCollections().toArray();
    
    console.log(`\n📊 Database: ${db.databaseName}`);
    console.log(`   Collections: ${collections.length}`);
    
    if (collections.length > 0) {
      console.log('   Collection names:');
      collections.forEach((col) => {
        console.log(`     - ${col.name}`);
      });
    } else {
      console.log('   ⚠️  No collections found (database is empty)');
    }

    // Test if we can perform a simple query
    try {
      const Property = mongoose.models.Property || mongoose.model('Property', new mongoose.Schema({}, { strict: false }));
      const count = await Property.countDocuments();
      console.log(`\n📝 Properties collection: ${count} documents`);
    } catch (err: any) {
      if (err.message.includes('model')) {
        console.log('\n📝 Properties collection: Not yet created (this is OK)');
      }
    }

    // Get server info
    const adminDb = db.admin();
    const serverStatus = await adminDb.serverStatus();
    console.log(`\n🖥️  MongoDB Server:`);
    console.log(`   Version: ${serverStatus.version}`);
    console.log(`   Uptime: ${Math.floor(serverStatus.uptime / 3600)} hours`);

    await mongoose.disconnect();
    console.log('\n✅ All tests passed! MongoDB is working correctly.\n');
    process.exit(0);
  } catch (err: any) {
    console.error('\n❌ ERROR: MongoDB connection failed!');
    console.error(`   ${err.message}\n`);
    
    if (err.message.includes('authentication')) {
      console.error('   💡 Tip: Check your username and password in the connection string');
    } else if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
      console.error('   💡 Tip: Check if the MongoDB hostname is correct');
    } else if (err.message.includes('ECONNREFUSED')) {
      console.error('   💡 Tip: Check if MongoDB server is running');
    }
    
    process.exit(1);
  }
}

testConnection();
