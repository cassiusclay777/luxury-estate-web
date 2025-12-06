/**
 * =============================================================================
 * VOICE QUERY PARSER API - Groq-powered Czech NLP
 * =============================================================================
 * Parses Czech voice search queries into structured filters
 * Uses Groq Llama 3.1 8B for fast, accurate parsing
 *
 * @author LuxEstate Team 2025
 * @license MIT
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseVoiceQuery } from '@/lib/groq';

// =============================================================================
// TYPES
// =============================================================================

interface VoiceParseRequest {
  query: string;
}

interface VoiceParseResponse {
  success: boolean;
  filters?: {
    type?: string;
    rooms?: number;
    city?: string;
    district?: string;
    maxPrice?: number;
    minPrice?: number;
    minArea?: number;
    maxArea?: number;
  };
  originalQuery?: string;
  error?: string;
}

// =============================================================================
// API ROUTE
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body: VoiceParseRequest = await request.json();
    const { query } = body;

    // Validate
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid query' },
        { status: 400 }
      );
    }

    if (query.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Query too long (max 500 characters)' },
        { status: 400 }
      );
    }

    console.log(`[Voice Parse] Processing: "${query}"`);

    // Parse with Groq AI
    const filters = await parseVoiceQuery(query);

    console.log('[Voice Parse] Result:', filters);

    const response: VoiceParseResponse = {
      success: true,
      filters,
      originalQuery: query,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Voice Parse] Error:', error);

    // Return graceful fallback - let client use local parsing
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/** GET: Health check and examples */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    examples: [
      {
        input: 'Najdi mi tři plus jedna v Brně do pěti milionů',
        output: {
          rooms: 4,
          city: 'Brno',
          maxPrice: 5000000,
        },
      },
      {
        input: 'Chci byt v Praze na Vinohradech, maximálně 10 milionů',
        output: {
          type: 'byt',
          city: 'Praha',
          district: 'Vinohrady',
          maxPrice: 10000000,
        },
      },
      {
        input: 'Rodinný dům v Ostravě do sedmi milionů',
        output: {
          type: 'dům',
          city: 'Ostrava',
          maxPrice: 7000000,
        },
      },
    ],
  });
}

export const runtime = 'nodejs';
export const maxDuration = 10;
