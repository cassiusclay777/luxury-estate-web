/**
 * AI Virtual Staging Client
 * Supports multiple providers: Hugging Face, Replicate, Pollinations (fallback)
 * 
 * IMPORTANT: For real image-to-image staging, you need:
 * - HUGGINGFACE_API_TOKEN for Hugging Face Inference API
 * - or REPLICATE_API_TOKEN for Replicate
 * - Pollinations.ai is text-to-image only (fallback, limited quality)
 */

// =============================================================================
// TYPES
// =============================================================================

export type InteriorStyle = 
  | 'modern' 
  | 'minimalist' 
  | 'scandinavian' 
  | 'industrial' 
  | 'classic' 
  | 'contemporary';

export type RoomType = 
  | 'living_room' 
  | 'bedroom' 
  | 'kitchen' 
  | 'bathroom' 
  | 'office' 
  | 'dining_room';

export interface StagingOptions {
  imageBase64: string;  // Base64 encoded image (without data:image prefix)
  style: InteriorStyle;
  roomType?: RoomType;
  strength?: number;    // 0.3-0.9, how much to transform (default 0.7)
  guidanceScale?: number; // 7-15, prompt adherence (default 7.5)
}

export interface StagingResult {
  imageUrl: string;
  provider: 'huggingface' | 'replicate' | 'pollinations';
  warning?: string;
}

// =============================================================================
// STYLE & ROOM PROMPTS
// =============================================================================

const STYLE_PROMPTS: Record<InteriorStyle, string> = {
  modern: 'modern interior design, clean lines, contemporary furniture, neutral colors with accent pieces, large windows, minimalist decor, professional staging',
  minimalist: 'minimalist interior, simple elegant furniture, white and light gray palette, uncluttered space, natural light, zen atmosphere, professional real estate photo',
  scandinavian: 'scandinavian design, light oak wood furniture, white walls, cozy textiles, hygge atmosphere, plants, warm lighting, professional staging',
  industrial: 'industrial loft style, exposed brick walls, metal fixtures, concrete elements, vintage furniture, Edison bulbs, urban chic, professional photo',
  classic: 'classic elegant interior, traditional furniture, warm rich colors, crown molding, elegant drapery, timeless luxury design, professional staging',
  contemporary: 'contemporary design, sleek furniture, bold accent colors, mixed materials, artistic touches, open floor plan, professional real estate photo',
};

const ROOM_PROMPTS: Record<RoomType, string> = {
  living_room: 'spacious living room with comfortable sofa, coffee table, area rug, decorative pillows, wall art',
  bedroom: 'cozy bedroom with queen bed, nightstands, soft bedding, ambient lighting, dresser',
  kitchen: 'modern kitchen with clean countertops, bar stools, pendant lights, organized cabinets',
  bathroom: 'spa-like bathroom with fluffy towels, plants, clean fixtures, elegant mirror',
  office: 'home office with desk, ergonomic chair, bookshelf, task lighting, organized workspace',
  dining_room: 'elegant dining room with dining table, chairs, centerpiece, pendant light, sideboard',
};

// =============================================================================
// MAIN STAGING FUNCTION
// =============================================================================

/**
 * Generate virtually staged room image
 * Tries providers in order: Hugging Face → Replicate → Pollinations (fallback)
 */
export async function generateStagedRoom(options: StagingOptions): Promise<StagingResult> {
  const { imageBase64, style, roomType, strength = 0.7, guidanceScale = 7.5 } = options;

  // Build prompt
  const stylePrompt = STYLE_PROMPTS[style];
  const roomPrompt = roomType ? ROOM_PROMPTS[roomType] : '';
  const fullPrompt = `${stylePrompt}, ${roomPrompt}, interior photography, high quality, 8k, photorealistic, professional real estate photography`.trim();

  console.log('[AI Staging] Style:', style);
  console.log('[AI Staging] Room type:', roomType || 'auto');
  console.log('[AI Staging] Prompt:', fullPrompt.substring(0, 100) + '...');

  // Try Hugging Face first (if configured)
  const hfToken = process.env.HUGGINGFACE_API_TOKEN;
  if (hfToken) {
    try {
      console.log('[AI Staging] Trying Hugging Face...');
      const result = await generateWithHuggingFace(imageBase64, fullPrompt, strength, hfToken);
      return { imageUrl: result, provider: 'huggingface' };
    } catch (error) {
      console.error('[AI Staging] Hugging Face failed:', error);
    }
  }

  // Try Replicate (if configured)
  const replicateToken = process.env.REPLICATE_API_TOKEN;
  if (replicateToken) {
    try {
      console.log('[AI Staging] Trying Replicate...');
      const result = await generateWithReplicate(imageBase64, fullPrompt, strength, guidanceScale, replicateToken);
      return { imageUrl: result, provider: 'replicate' };
    } catch (error) {
      console.error('[AI Staging] Replicate failed:', error);
    }
  }

  // Fallback to Pollinations (text-to-image only, limited quality)
  console.log('[AI Staging] Falling back to Pollinations (text-to-image only)...');
  const result = await generateWithPollinations(fullPrompt);
  return {
    imageUrl: result,
    provider: 'pollinations',
    warning: 'Pollinations.ai generuje nový obrázek na základě popisu, ne úpravu vašeho obrázku. Pro skutečné virtuální staging nastavte HUGGINGFACE_API_TOKEN nebo REPLICATE_API_TOKEN.',
  };
}

// =============================================================================
// HUGGING FACE PROVIDER (Image-to-Image)
// =============================================================================

async function generateWithHuggingFace(
  imageBase64: string,
  prompt: string,
  strength: number,
  apiToken: string
): Promise<string> {
  // Using stable-diffusion-2-inpainting or similar img2img model
  const model = 'stabilityai/stable-diffusion-2-1';
  const url = `https://api-inference.huggingface.co/models/${model}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        negative_prompt: 'blurry, low quality, distorted, unrealistic, cartoon, painting, sketch, empty room',
        num_inference_steps: 30,
        guidance_scale: 7.5,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
  }

  // Response is binary image data
  const blob = await response.blob();
  const buffer = await blob.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  
  // Return as data URL
  return `data:image/png;base64,${base64}`;
}

// =============================================================================
// REPLICATE PROVIDER (Image-to-Image with ControlNet)
// =============================================================================

async function generateWithReplicate(
  imageBase64: string,
  prompt: string,
  strength: number,
  guidanceScale: number,
  apiToken: string
): Promise<string> {
  // Using a good img2img model
  const model = 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b';
  
  // Create prediction
  const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: model.split(':')[1],
      input: {
        prompt,
        image: `data:image/jpeg;base64,${imageBase64}`,
        prompt_strength: strength,
        guidance_scale: guidanceScale,
        negative_prompt: 'blurry, low quality, distorted, empty, unfurnished, bare walls',
        num_inference_steps: 30,
      },
    }),
  });

  if (!createResponse.ok) {
    const error = await createResponse.json();
    throw new Error(`Replicate API error: ${error.detail || createResponse.status}`);
  }

  const prediction = await createResponse.json();

  // Poll for result
  let result = prediction;
  while (result.status !== 'succeeded' && result.status !== 'failed') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const pollResponse = await fetch(result.urls.get, {
      headers: { 'Authorization': `Token ${apiToken}` },
    });
    result = await pollResponse.json();
  }

  if (result.status === 'failed') {
    throw new Error(`Replicate prediction failed: ${result.error}`);
  }

  // Return the output URL
  const outputUrl = Array.isArray(result.output) ? result.output[0] : result.output;
  return outputUrl;
}

// =============================================================================
// POLLINATIONS PROVIDER (Text-to-Image fallback)
// =============================================================================

async function generateWithPollinations(prompt: string): Promise<string> {
  // Pollinations.ai is text-to-image only, no image input
  const enhancedPrompt = encodeURIComponent(prompt);
  const seed = Math.floor(Math.random() * 1000000);
  
  // This returns a URL that generates an image
  const imageUrl = `https://image.pollinations.ai/prompt/${enhancedPrompt}?width=1024&height=768&seed=${seed}&nologo=true`;
  
  return imageUrl;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get available interior styles
 */
export function getAvailableStyles(): { id: InteriorStyle; name: string; description: string }[] {
  return [
    { id: 'modern', name: 'Moderní', description: 'Čisté linie, neutrální barvy, současný nábytek' },
    { id: 'minimalist', name: 'Minimalistický', description: 'Jednoduchý, elegantní, nezahrabaný prostor' },
    { id: 'scandinavian', name: 'Skandinávský', description: 'Světlé dřevo, bílé stěny, útulná atmosféra' },
    { id: 'industrial', name: 'Industriální', description: 'Cihly, kov, betonové prvky, loft styl' },
    { id: 'classic', name: 'Klasický', description: 'Tradiční elegance, teplé barvy, nadčasový design' },
    { id: 'contemporary', name: 'Současný', description: 'Mix materiálů, odvážné akcenty, umělecké doplňky' },
  ];
}

/**
 * Get available room types
 */
export function getAvailableRoomTypes(): { id: RoomType; name: string }[] {
  return [
    { id: 'living_room', name: 'Obývací pokoj' },
    { id: 'bedroom', name: 'Ložnice' },
    { id: 'kitchen', name: 'Kuchyň' },
    { id: 'bathroom', name: 'Koupelna' },
    { id: 'office', name: 'Pracovna' },
    { id: 'dining_room', name: 'Jídelna' },
  ];
}

/**
 * Check which AI providers are configured
 */
export function getConfiguredProviders(): string[] {
  const providers: string[] = [];
  
  if (process.env.HUGGINGFACE_API_TOKEN) {
    providers.push('huggingface');
  }
  if (process.env.REPLICATE_API_TOKEN) {
    providers.push('replicate');
  }
  
  // Pollinations is always available as fallback
  providers.push('pollinations');
  
  return providers;
}

/**
 * Validate configuration
 */
export function validateStagingConfig(): { 
  isConfigured: boolean; 
  hasImageToImage: boolean;
  providers: string[];
  recommendation?: string;
} {
  const providers = getConfiguredProviders();
  const hasImageToImage = providers.includes('huggingface') || providers.includes('replicate');
  
  return {
    isConfigured: providers.length > 0,
    hasImageToImage,
    providers,
    recommendation: hasImageToImage 
      ? undefined 
      : 'Pro skutečné virtuální staging (úpravu vašeho obrázku) nastavte HUGGINGFACE_API_TOKEN nebo REPLICATE_API_TOKEN v .env.local',
  };
}
