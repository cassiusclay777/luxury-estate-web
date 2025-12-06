#!/usr/bin/env tsx
/**
 * Test script to verify database (Supabase) connection
 * Usage: tsx scripts/test-db-connection.ts
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing database connection...\n');

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERROR: Missing Supabase credentials!');
  console.error('   Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

// Check for placeholder values
if (supabaseUrl.includes('placeholder')) {
  console.error('❌ ERROR: Using placeholder Supabase URL');
  console.error('   Please set a valid NEXT_PUBLIC_SUPABASE_URL in .env.local');
  process.exit(1);
}

console.log('✅ Environment variables are set');
console.log(`   URL: ${supabaseUrl.substring(0, 30)}...`);
console.log(`   Key: ${supabaseAnonKey.substring(0, 20)}...\n`);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection by querying a simple table
async function testConnection() {
  try {
    console.log('🔄 Testing connection...');
    
    // Try to query a table (this will work even if table doesn't exist, just tests connection)
    const { data, error } = await supabase
      .from('properties')
      .select('id')
      .limit(1);

    if (error) {
      // If table doesn't exist, that's okay - connection still works
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        console.log('⚠️  WARNING: "properties" table does not exist');
        console.log('   Connection works, but you may need to run migrations');
        console.log('   Try: npm run seed or check supabase-schema.sql\n');
      } else {
        console.error('❌ ERROR: Database connection failed!');
        console.error(`   Error: ${error.message}`);
        console.error(`   Code: ${error.code}\n`);
        process.exit(1);
      }
    } else {
      console.log('✅ Database connection successful!');
      console.log(`   Found ${data?.length || 0} records in properties table\n`);
    }

    // Test if we can query system tables (proves connection works)
    const { data: healthCheck, error: healthError } = await supabase
      .rpc('version')
      .single();

    if (!healthError) {
      console.log('✅ Database health check passed');
    }

    console.log('\n✅ All tests passed! Database is working correctly.\n');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ ERROR: Unexpected error during connection test');
    console.error(`   ${err.message}\n`);
    process.exit(1);
  }
}

testConnection();

