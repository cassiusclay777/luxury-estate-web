/**
 * =============================================================================
 * REPLICATE CLIENT - AI Image Generation
 * =============================================================================
 * Wrapper for Replicate API with SDXL-LCM model
 * Optimized for real estate virtual staging
 * 
 * @author LuxEstate Team 2025
 * @license MIT
 */

// =============================================================================
// TYPES
// =============================================================================

export interface ReplicatePrediction {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string | string[];
  error?: string;
  metrics?: {
    predict_time?: number;
  };
  urls: {
    get: string;
    cancel: string;
  };
}

export interface StagingStyle {
  id: string;
  name: string;
  nameEn: string;
  prompt: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';

/** SDXL-LCM model for ultra-fast generation */
export const SDXL_LCM_VERSION = 'a62d3b87f6a979ccc38e5f5d96c9e2e17d201bcab85e9c5a5c87d0ffb4d83c3e';

/** Available staging styles */
export const STAGING_STYLES: StagingStyle[] = [
  {
    id: 'modern',
    name: 'Moderní',
    nameEn: 'Modern',
    prompt: 'modern interior design, clean lines, minimalist furniture, neutral colors, large windows, contemporary art, polished floors, designer lighting',
  },
  {
    id: 'scandinavian',
    name: 'Skandinávský',
    nameEn: 'Scandinavian',
    prompt: 'scandinavian interior, light oak wood, white walls, cozy textiles, hygge atmosphere, natural light, minimalist, warm neutral palette, plants',
  },
  {
    id: 'industrial',
    name: 'Industriální',
    nameEn: 'Industrial',
    prompt: 'industrial loft, exposed brick, metal beams, concrete floors, vintage furniture, Edison bulbs, leather, factory windows, urban chic',
  },
  {
    id: 'bohemian',
    name: 'Bohémský',
    nameEn: 'Bohemian',
    prompt: 'bohemian interior, colorful textiles, macrame, plants everywhere, vintage rugs, eclectic furniture, warm lighting, artistic decor',
  },
  {
    id: 'luxury',
    name: 'Luxusní',
    nameEn: 'Luxury',
    prompt: 'luxury interior, marble floors, gold accents, crystal chandelier, velvet furniture, high ceilings, bespoke millwork, premium materials',
  },
];

const NEGATIVE_PROMPT = 'blurry, low quality, distorted, ugly, watermark, text, logo, cartoon, painting, illustration, drawing';

// =============================================================================
// CLIENT
// =============================================================================

/**
 * Get Replicate API token
 */
function getApiToken(): string {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error('REPLICATE_API_TOKEN is not configured. Add it to .env.local');
  }
  return token;
}

/**
 * Create a new prediction
 */
async function createPrediction(input: Record<string, unknown>): Promise<ReplicatePrediction> {
  const response = await fetch(REPLICATE_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${getApiToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: SDXL_LCM_VERSION,
      input,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Replicate API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Poll prediction until complete
 */
async function waitForPrediction(
  prediction: ReplicatePrediction,
  maxWaitMs: number = 60000
): Promise<ReplicatePrediction> {
  const startTime = Date.now();
  let result = prediction;

  while (result.status !== 'succeeded' && result.status !== 'failed') {
    if (Date.now() - startTime > maxWaitMs) {
      throw new Error('Prediction timeout');
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = await fetch(result.urls.get, {
      headers: { 'Authorization': `Token ${getApiToken()}` },
    });

    result = await response.json();
  }

  if (result.status === 'failed') {
    throw new Error(result.error || 'Prediction failed');
  }

  return result;
}

/**
 * Generate staged room image
 */
export async function generateStagedImage(
  imageUrl: string,
  styleId: string
): Promise<{ url: string; duration: number }> {
  const startTime = Date.now();

  // Find style
  const style = STAGING_STYLES.find(s => s.id === styleId);
  if (!style) {
    throw new Error(`Invalid style: ${styleId}`);
  }

  // Create prediction
  const prediction = await createPrediction({
    image: imageUrl,
    prompt: `transform this room into ${style.prompt}, professional real estate photography, 8k, photorealistic`,
    negative_prompt: NEGATIVE_PROMPT,
    prompt_strength: 0.65,
    num_inference_steps: 8, // LCM needs fewer steps
    guidance_scale: 2.0,
    scheduler: 'LCMScheduler',
    width: 1024,
    height: 768,
  });

  // Wait for result
  const result = await waitForPrediction(prediction);

  const output = Array.isArray(result.output) ? result.output[0] : result.output;
  if (!output) {
    throw new Error('No output image generated');
  }

  return {
    url: output,
    duration: Date.now() - startTime,
  };
}

/**
 * Generate image from text prompt (for thumbnails, etc.)
 */
export async function generateImage(
  prompt: string,
  options: {
    width?: number;
    height?: number;
    negativePrompt?: string;
  } = {}
): Promise<string> {
  const { width = 1024, height = 768, negativePrompt = NEGATIVE_PROMPT } = options;

  const prediction = await createPrediction({
    prompt,
    negative_prompt: negativePrompt,
    num_inference_steps: 8,
    guidance_scale: 2.0,
    scheduler: 'LCMScheduler',
    width,
    height,
  });

  const result = await waitForPrediction(prediction);

  const output = Array.isArray(result.output) ? result.output[0] : result.output;
  if (!output) {
    throw new Error('No output image generated');
  }

  return output;
}

/**
 * Check if Replicate is configured
 */
export function isReplicateConfigured(): boolean {
  return !!process.env.REPLICATE_API_TOKEN;
}

/**
 * Get available styles
 */
export function getStyles(): StagingStyle[] {
  return STAGING_STYLES;
}
