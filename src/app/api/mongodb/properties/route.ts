// /src/app/api/mongodb/properties/route.ts
// Example API route using MongoDB
import { NextRequest, NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  searchProperties,
} from '@/lib/mongodb/properties';

/**
 * GET /api/mongodb/properties
 * Fetch properties from MongoDB
 */
export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '12');

    // Text search
    if (query) {
      const properties = await searchProperties(query, pageSize);
      return NextResponse.json({
        success: true,
        properties,
        count: properties.length,
      });
    }

    // Filtered search
    const filters = {
      city: searchParams.get('city') || undefined,
      type: searchParams.get('type') || undefined,
      status: searchParams.get('status') || undefined,
      minPrice: searchParams.get('minPrice')
        ? parseInt(searchParams.get('minPrice')!)
        : undefined,
      maxPrice: searchParams.get('maxPrice')
        ? parseInt(searchParams.get('maxPrice')!)
        : undefined,
      published: searchParams.get('published') === 'true',
    };

    const result = await getProperties(filters, page, pageSize);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error fetching properties from MongoDB:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/mongodb/properties
 * Create new property in MongoDB
 */
export async function POST(request: NextRequest) {
  try {
    await connectMongoDB();

    const data = await request.json();
    const property = await createProperty(data);

    return NextResponse.json({
      success: true,
      property,
    });
  } catch (error) {
    console.error('Error creating property in MongoDB:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

