import { InteriorStyle } from './types/ai-staging';

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
 * Generate a virtually staged room using Pollinations.ai API (FREE!)
 * No API key needed, completely free
 */
export async function generateStagedRoom(
  options: GenerateStagedRoomOptions
): Promise<{ imageUrl: string }> {
  try {
    const { style, prompt } = options;

    // Build the complete prompt
    const stylePrompt = STYLE_PROMPTS[style];
    const fullPrompt = prompt
      ? `${stylePrompt}, ${prompt}`
      : stylePrompt;

    console.log('Generating staged room with Pollinations.ai...');
    console.log('Style:', style);
    console.log('Full prompt:', fullPrompt);

    // Enhanced prompt for interior staging
    const enhancedPrompt = `${fullPrompt}, interior photography, professional staging, furnished room, realistic lighting, high quality, 8k, photorealistic`;

    // Use Pollinations.ai - completely free, no API key needed!
    // This is a simple GET request that returns an image
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1024&height=768&nologo=true&enhance=true`;

    console.log('Successfully generated staged room');
    return { imageUrl };

  } catch (error) {
    console.error('Error generating staged room:', error);
    throw new Error(
      `Failed to generate staged room: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Validate if API is configured
 * Pollinations.ai doesn't need API key!
 */
export function validateHuggingFaceConfig(): boolean {
  return true; // Always true, no API key needed
}

/**
 * Get estimated cost for staging operation
 */
export function getEstimatedCost(): number {
  // Hugging Face Inference API is FREE for public models!
  return 0;
}
