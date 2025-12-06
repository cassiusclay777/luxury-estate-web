import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/properties
 * Fetch all properties (with optional filters)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Build query
    let query = supabase
      .from('properties')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    // Filters
    const type = searchParams.get('type');
    const city = searchParams.get('city');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minArea = searchParams.get('minArea');
    const maxArea = searchParams.get('maxArea');

    if (type) query = query.eq('type', type);
    if (city) query = query.eq('city', city);
    if (minPrice) query = query.gte('price', parseInt(minPrice));
    if (maxPrice) query = query.lte('price', parseInt(maxPrice));
    if (minArea) query = query.gte('area', parseInt(minArea));
    if (maxArea) query = query.lte('area', parseInt(maxArea));

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      properties: data,
      count: data?.length || 0
    });

  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/properties
 * Create new property (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Generate slug from title
    const slug = body.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const propertyData = {
      ...body,
      slug: `${slug}-${Date.now().toString(36)}`,
      main_image: body.images?.[0] || null
    };

    const { data, error } = await supabase
      .from('properties')
      .insert([propertyData])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      property: data
    });

  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/properties
 * Update existing property (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Property ID is required'
        },
        { status: 400 }
      );
    }

    // If title is being updated, regenerate slug
    if (updateData.title) {
      const slug = updateData.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      updateData.slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Update main_image if images array changed
    if (updateData.images && updateData.images.length > 0) {
      updateData.main_image = updateData.images[0];
    }

    const { data, error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      property: data
    });

  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/properties
 * Delete property (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Property ID is required'
        },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
