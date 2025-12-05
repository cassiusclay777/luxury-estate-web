import Replicate from 'replicate';
import { InteriorStyle, StagingRequest } from './types/ai-staging';

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

// Style to prompt mapping
const STYLE_PROMPTS: Record<InteriorStyle, string> = {
  modern: 'modern interior design, clean lines, contemporary furniture, neutral colors, minimalist decor',
  minimalist: 'minimalist interior, simple furniture, white walls, natural light, uncluttered space',
  industrial: 'industrial loft style, exposed brick, metal fixtures, concrete floors, vintage industrial furniture',
  scandinavian: 'scandinavian design, light wood, white and pastel colors, cozy textiles, hygge atmosphere',
  classic: 'classic elegant interior, traditional furniture, warm colors, ornate details, timeless design',
  loft: 'open loft space, high ceilings, large windows, modern urban furniture, exposed elements',
  rustic: 'rustic interior, natural wood, stone accents, warm earthy tones, cozy country style',
  contemporary: 'contemporary design, sleek furniture, bold accents, mixed materials, artistic touches',
};

export interface GenerateStagedRoomOptions {
  imageUrl: string;
  style: InteriorStyle;
  prompt?: string;
}

/**
 * Generate a virtually staged room using AI
 * @param options - Configuration for staging generation
 * @returns Promise with the generated image URL
 */
export async function generateStagedRoom(
  options: GenerateStagedRoomOptions
): Promise<{ imageUrl: string }> {
  try {
    const { imageUrl, style, prompt } = options;

    // Build the complete prompt
    const stylePrompt = STYLE_PROMPTS[style];
    const fullPrompt = prompt
      ? `${stylePrompt}, ${prompt}`
      : stylePrompt;

    console.log('Generating staged room with Replicate...');
    console.log('Style:', style);
    console.log('Full prompt:', fullPrompt);

    // Use interior design model from Replicate
    // Model: adirik/interior-design or similar
    const output = await replicate.run(
      'jagilley/controlnet-hough:854e8727697a057c525cdb45ab037f64ecca770a1769cc52287c2e56472a247b',
      {
        input: {
          image: imageUrl,
          prompt: fullPrompt,
          num_samples: '1',
          image_resolution: '512',
          ddim_steps: 20,
          scale: 9,
          a_prompt: 'best quality, extremely detailed, professional interior photography, 8k',
          n_prompt: 'longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, blurry',
        },
      }
    );

    // Replicate returns array of image URLs
    const resultUrl = Array.isArray(output) ? output[0] : output;

    if (!resultUrl || typeof resultUrl !== 'string') {
      throw new Error('Invalid response from AI model');
    }

    console.log('Successfully generated staged room');
    return { imageUrl: resultUrl };

  } catch (error) {
    console.error('Error generating staged room:', error);
    throw new Error(
      `Failed to generate staged room: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Validate if Replicate API is configured
 */
export function validateReplicateConfig(): boolean {
  return !!process.env.REPLICATE_API_TOKEN;
}

/**
 * Get estimated cost for staging operation
 * @returns Estimated cost in USD
 */
export function getEstimatedCost(): number {
  // ControlNet model costs approximately $0.0055 per run
  return 0.01; // Round up for safety
}
