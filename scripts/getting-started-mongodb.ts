#!/usr/bin/env tsx
/**
 * MongoDB + Mongoose Getting Started Example
 * Přizpůsobeno pro LuxEstate projekt
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

if (!MONGODB_URI) {
  console.error('❌ Missing MONGODB_URI in .env.local');
  process.exit(1);
}

// =============================================================================
// 1. DEFINE SCHEMA
// =============================================================================

// Property schema - podobně jako Kitten v příkladu
const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  price: {
    type: Number,
    required: true,
  },
  city: String,
  bedrooms: Number,
  bathrooms: Number,
  area: Number,
  type: {
    type: String,
    enum: ['apartment', 'house', 'land', 'commercial'],
  },
  status: {
    type: String,
    enum: ['sale', 'rent'],
  },
  published: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// =============================================================================
// 2. ADD CUSTOM METHODS (před kompilací modelu!)
// =============================================================================

// Metoda pro formátování ceny
propertySchema.methods.getFormattedPrice = function () {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
  }).format(this.price);
};

// Metoda pro získání popisu nemovitosti
propertySchema.methods.getDescription = function () {
  const parts = [];
  if (this.bedrooms) parts.push(`${this.bedrooms} pokojů`);
  if (this.bathrooms) parts.push(`${this.bathrooms} koupelen`);
  if (this.area) parts.push(`${this.area} m²`);
  
  const details = parts.length > 0 ? ` (${parts.join(', ')})` : '';
  return `${this.title} v ${this.city || 'neznámém městě'}${details}`;
};

// =============================================================================
// 3. COMPILE MODEL
// =============================================================================

const Property = mongoose.models.Property || mongoose.model('Property', propertySchema);

// =============================================================================
// 4. MAIN FUNCTION
// =============================================================================

async function main() {
  try {
    console.log('🔄 Connecting to MongoDB...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI!);
    console.log('✅ Connected to MongoDB!\n');

    // ========================================================================
    // 5. CREATE DOCUMENT
    // ========================================================================
    
    console.log('📝 Creating property document...');
    const property = new Property({
      title: 'Luxusní byt v centru Prahy',
      description: 'Nádherný byt s výhledem na Pražský hrad',
      price: 8500000,
      city: 'Praha 1',
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      type: 'apartment',
      status: 'sale',
      published: true,
    });

    console.log('Property title:', property.title);
    console.log('Formatted price:', property.getFormattedPrice());
    console.log('Description:', property.getDescription());
    console.log();

    // ========================================================================
    // 6. SAVE TO DATABASE
    // ========================================================================
    
    console.log('💾 Saving to database...');
    await property.save();
    console.log('✅ Property saved!\n');

    // ========================================================================
    // 7. QUERY ALL PROPERTIES
    // ========================================================================
    
    console.log('🔍 Finding all properties...');
    const allProperties = await Property.find();
    console.log(`Found ${allProperties.length} properties:`);
    allProperties.forEach((prop, index) => {
      console.log(`  ${index + 1}. ${prop.getDescription()} - ${prop.getFormattedPrice()}`);
    });
    console.log();

    // ========================================================================
    // 8. QUERY WITH FILTERS
    // ========================================================================
    
    console.log('🔍 Finding properties in Praha...');
    const prahaProperties = await Property.find({ city: /^Praha/ });
    console.log(`Found ${prahaProperties.length} properties in Praha\n`);

    console.log('🔍 Finding apartments...');
    const apartments = await Property.find({ type: 'apartment' });
    console.log(`Found ${apartments.length} apartments\n`);

    console.log('🔍 Finding properties under 10M...');
    const affordable = await Property.find({ price: { $lt: 10000000 } });
    console.log(`Found ${affordable.length} properties under 10M CZK\n`);

    // ========================================================================
    // 9. CREATE MORE PROPERTIES
    // ========================================================================
    
    console.log('📝 Creating more properties...');
    const properties = [
      new Property({
        title: 'Moderní vila s bazénem',
        description: 'Architektonicky unikátní vila s infinity bazénem',
        price: 25000000,
        city: 'Praha 6',
        bedrooms: 5,
        bathrooms: 4,
        area: 350,
        type: 'house',
        status: 'sale',
        published: true,
      }),
      new Property({
        title: 'Krásný byt 2+kk',
        description: 'Slunný byt v klidné lokalitě',
        price: 4500000,
        city: 'Brno',
        bedrooms: 2,
        bathrooms: 1,
        area: 65,
        type: 'apartment',
        status: 'sale',
        published: true,
      }),
    ];

    for (const prop of properties) {
      await prop.save();
      console.log(`  ✅ Saved: ${prop.getDescription()}`);
    }
    console.log();

    // ========================================================================
    // 10. FINAL QUERY
    // ========================================================================
    
    console.log('🔍 Final count of all properties:');
    const finalCount = await Property.countDocuments();
    console.log(`Total properties in database: ${finalCount}\n`);

    console.log('✅ All operations completed successfully!\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Close connection
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run main function
main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
