// /src/lib/mongodb/properties.ts
// MongoDB property operations
import connectMongoDB from '../mongodb';
import Property, { IProperty } from './models/Property';

export interface PropertyFilters {
  city?: string;
  type?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  minArea?: number;
  maxArea?: number;
  published?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Get all properties with optional filters and pagination
 */
export async function getProperties(
  filters?: PropertyFilters,
  page = 1,
  pageSize = 12
): Promise<PaginatedResult<IProperty>> {
  await connectMongoDB();

  const query: any = {};

  // Apply filters
  if (filters) {
    if (filters.city) {
      query.city = { $regex: filters.city, $options: 'i' };
    }
    if (filters.type) {
      query.type = filters.type;
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) {
        query.price.$gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        query.price.$lte = filters.maxPrice;
      }
    }
    if (filters.minBedrooms !== undefined) {
      query.bedrooms = { $gte: filters.minBedrooms };
    }
    if (filters.minBathrooms !== undefined) {
      query.bathrooms = { $gte: filters.minBathrooms };
    }
    if (filters.minArea !== undefined || filters.maxArea !== undefined) {
      query.area = {};
      if (filters.minArea !== undefined) {
        query.area.$gte = filters.minArea;
      }
      if (filters.maxArea !== undefined) {
        query.area.$lte = filters.maxArea;
      }
    }
    if (filters.published !== undefined) {
      query.published = filters.published;
    }
  }

  const skip = (page - 1) * pageSize;

  const [data, count] = await Promise.all([
    Property.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean(),
    Property.countDocuments(query),
  ]);

  return {
    data: data as IProperty[],
    count,
    page,
    pageSize,
    totalPages: Math.ceil(count / pageSize),
  };
}

/**
 * Get single property by ID or slug
 */
export async function getProperty(idOrSlug: string): Promise<IProperty | null> {
  await connectMongoDB();

  // Try to find by _id first (MongoDB ObjectId)
  if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
    const property = await Property.findById(idOrSlug).lean();
    if (property) return property as IProperty;
  }

  // Try by slug
  const property = await Property.findOne({ slug: idOrSlug }).lean();
  return property as IProperty | null;
}

/**
 * Create a new property
 */
export async function createProperty(data: Partial<IProperty>): Promise<IProperty> {
  await connectMongoDB();

  const property = new Property(data);
  await property.save();
  return property.toObject() as IProperty;
}

/**
 * Update a property
 */
export async function updateProperty(
  id: string,
  data: Partial<IProperty>
): Promise<IProperty | null> {
  await connectMongoDB();

  const property = await Property.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).lean();

  return property as IProperty | null;
}

/**
 * Delete a property
 */
export async function deleteProperty(id: string): Promise<boolean> {
  await connectMongoDB();

  const result = await Property.findByIdAndDelete(id);
  return !!result;
}

/**
 * Search properties by text
 */
export async function searchProperties(searchQuery: string, limit = 20): Promise<IProperty[]> {
  await connectMongoDB();

  const properties = await Property.find({
    $text: { $search: searchQuery },
  })
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .lean();

  return properties as IProperty[];
}

