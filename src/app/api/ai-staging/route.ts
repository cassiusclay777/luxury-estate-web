/**
 * =============================================================================
 * AI VIRTUAL STAGING API - REPLICATE SDXL-LCM
 * =============================================================================
 * Ultra-fast AI staging with Replicate's SDXL-LCM model
 * Supports 5 styles: Modern, Scandinavian, Industrial, Bohemian, Luxury
 * Target: < 6 seconds generation time
 * 
 * @author LuxEstate Team 2025
 * @license MIT
 */

import { NextRequest, NextResponse } from 'next/server';

// =============================================================================
// TYPES & CONSTANTS
// =============================================================================

export type StagingStyle = 'modern' | 'scandinavian' | 'industrial' | 'bohemian' | 'luxury';

interface StagingRequest {
  imageUrl: string;
  style: StagingStyle;
  roomType?: string;
}

interface ReplicateResponse {
  id: string;
  status: string;
  output?: string[];
  error?: string;
}

/** Style-specific prompts optimized for interior staging */
const STYLE_PROMPTS: Record<StagingStyle, string> = {
  modern: 'modern interior design, clean lines, minimalist furniture, neutral colors, large windows, contemporary art, polished concrete floors, designer lighting, open floor plan, 8k, photorealistic, architectural photography',
  scandinavian: 'scandinavian interior design, light oak wood floors, white walls, cozy textiles, hygge atmosphere, natural light, minimalist decor, warm neutral palette, wool throws, ceramic vases, 8k, photorealistic',
  industrial: 'industrial loft interior, exposed brick walls, metal beams, concrete floors, vintage furniture, Edison bulbs, leather sofas, factory windows, urban chic, raw materials, 8k, photorealistic',
  bohemian: 'bohemian interior design, colorful textiles, macrame wall hangings, plants everywhere, vintage rugs, eclectic furniture mix, warm ambient lighting, artistic decor, moroccan poufs, 8k, photorealistic',
  luxury: 'luxury interior design, marble floors, gold accents, crystal chandeliers, velvet furniture, high ceilings, bespoke millwork, art collection, designer furniture, premium materials, 8k, photorealistic, architectural digest'
};

const NEGATIVE_PROMPT = 'blurry, low quality, distorted, ugly, bad anatomy, watermark, text, logo, oversaturated, cartoon, painting, illustration, drawing, art, sketch';

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW = 60 * 1000;

// =============================================================================
// HELPERS
// =============================================================================

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT - record.count };
}

/**
 * Generate staged image using Replicate SDXL-LCM
 * Uses img2img for real transformation of input image
 */
async function generateWithReplicate(
  imageUrl: string,
  style: StagingStyle
): Promise<string> {
  const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
  
  if (!REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN not configured');
  }

  const prompt = STYLE_PROMPTS[style];

  // Create prediction with SDXL-LCM (fastest model)
  const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // SDXL-LCM for ultra-fast generation (< 6 sec)
      version: 'a62d3b87f6a979ccc38e5f5d96c9e2e17d201bcab85e9c5a5c87d0ffb4d83c3e',
      input: {
        image: imageUrl,
        prompt: `transform this room into ${prompt}`,
        negative_prompt: NEGATIVE_PROMPT,
        prompt_strength: 0.65, // Balance between original and new style
        num_inference_steps: 8, // LCM needs fewer steps
        guidance_scale: 2.0, // Lower for LCM
        scheduler: 'LCMScheduler',
        width: 1024,
        height: 768,
      },
    }),
  });

  if (!createResponse.ok) {
    const error = await createResponse.text();
    throw new Error(`Replicate API error: ${error}`);
  }

  const prediction: ReplicateResponse = await createResponse.json();

  // Poll for completion (should be < 6 seconds with LCM)
  let result = prediction;
  const maxAttempts = 30; // 30 seconds max
  let attempts = 0;

  while (result.status !== 'succeeded' && result.status !== 'failed' && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
      headers: { 'Authorization': `Token ${REPLICATE_API_TOKEN}` },
    });
    
    result = await pollResponse.json();
    attempts++;
  }

  if (result.status === 'failed') {
    throw new Error(result.error || 'Generation failed');
  }

  if (!result.output || result.output.length === 0) {
    throw new Error('No output generated');
  }

  return result.output[0];
}

/**
 * Fallback: Pollinations.ai (free, no API key)
 */
async function generateWithPollinations(style: StagingStyle): Promise<string> {
  const prompt = encodeURIComponent(STYLE_PROMPTS[style]);
  const seed = Math.floor(Math.random() * 1000000);
  return `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=768&seed=${seed}&nologo=true`;
}

// =============================================================================
// API ROUTES
// =============================================================================

/** GET: Return available styles and configuration */
export async function GET() {
  const hasReplicate = !!process.env.REPLICATE_API_TOKEN;
  
  return NextResponse.json({
    styles: [
      { id: 'modern', name: 'Moderní', description: 'Čisté linie, minimalistický nábytek' },
      { id: 'scandinavian', name: 'Skandinávský', description: 'Světlé dřevo, útulná atmosféra' },
      { id: 'industrial', name: 'Industriální', description: 'Cihly, kov, loftový styl' },
      { id: 'bohemian', name: 'Bohémský', description: 'Barevné textilie, eklektický mix' },
      { id: 'luxury', name: 'Luxusní', description: 'Mramor, zlato, prémiové materiály' },
    ],
    provider: hasReplicate ? 'replicate' : 'pollinations',
    estimatedTime: hasReplicate ? '< 6 sekund' : '< 3 sekundy',
    limits: {
      maxFileSizeMB: 10,
      rateLimit: `${RATE_LIMIT}/min`,
    },
  });
}

/** POST: Generate staged room image */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `stg_${Date.now().toString(36)}`;

  try {
    // Rate limit check
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = checkRateLimit(ip);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Try again in 1 minute.' },
        { status: 429 }
      );
    }

    // Parse request
    const body: StagingRequest = await request.json();
    const { imageUrl, style } = body;

    // Validation
    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing imageUrl' },
        { status: 400 }
      );
    }

    const validStyles: StagingStyle[] = ['modern', 'scandinavian', 'industrial', 'bohemian', 'luxury'];
    if (!style || !validStyles.includes(style)) {
      return NextResponse.json(
        { success: false, error: `Invalid style. Valid: ${validStyles.join(', ')}` },
        { status: 400 }
      );
    }

    console.log(`[${requestId}] Staging: ${style} | URL: ${imageUrl.substring(0, 50)}...`);

    // Generate with Replicate or fallback
    let resultUrl: string;
    let provider: string;

    if (process.env.REPLICATE_API_TOKEN) {
      resultUrl = await generateWithReplicate(imageUrl, style);
      provider = 'replicate';
    } else {
      resultUrl = await generateWithPollinations(style);
      provider = 'pollinations';
    }

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] Done in ${duration}ms via ${provider}`);

    return NextResponse.json({
      success: true,
      imageUrl: resultUrl,
      provider,
      metadata: {
        requestId,
        style,
        duration,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error(`[${requestId}] Error:`, error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId,
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const maxDuration = 60;
