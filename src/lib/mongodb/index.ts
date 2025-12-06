// /src/lib/mongodb/index.ts
// Central export for MongoDB functionality

export { default as connectMongoDB, isMongoDBConfigured, disconnectMongoDB } from '../mongodb';
export { default as Property, type IProperty } from './models/Property';

