// /src/lib/mongodb/models/Property.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IProperty extends Document {
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  type: 'apartment' | 'house' | 'land' | 'commercial';
  status: 'sale' | 'rent';
  published: boolean;
  features?: string[];
  images?: string[];
  lat?: number;
  lng?: number;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      index: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
      index: true,
    },
    bedrooms: {
      type: Number,
      default: 0,
    },
    bathrooms: {
      type: Number,
      default: 0,
    },
    area: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['apartment', 'house', 'land', 'commercial'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['sale', 'rent'],
      required: true,
      index: true,
    },
    published: {
      type: Boolean,
      default: false,
      index: true,
    },
    features: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    lat: {
      type: Number,
    },
    lng: {
      type: Number,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
PropertySchema.index({ city: 1, type: 1, status: 1 });
PropertySchema.index({ price: 1 });
PropertySchema.index({ lat: 1, lng: 1 }); // For geospatial queries
PropertySchema.index({ title: 'text', description: 'text' }); // For text search

// Prevent model re-compilation during hot reloads
const Property = mongoose.models.Property || mongoose.model<IProperty>('Property', PropertySchema);

export default Property;

