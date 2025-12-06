/**
 * =============================================================================
 * GROQ CLIENT - Ultra-fast LLM API
 * =============================================================================
 * Wrapper for Groq API with Llama 3.1 70B
 * Speed: 150+ tokens/second (fastest inference available)
 * 
 * @author LuxEstate Team 2025
 * @license MIT
 */

// =============================================================================
// TYPES
// =============================================================================

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqConfig {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stream?: boolean;
}

export interface GroqResponse {
  id: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// =============================================================================
// CONSTANTS
// =============================================================================

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/** Available Groq models */
export const GROQ_MODELS = {
  LLAMA_70B: 'llama-3.1-70b-versatile',
  LLAMA_8B: 'llama-3.1-8b-instant',
  MIXTRAL: 'mixtral-8x7b-32768',
  GEMMA: 'gemma2-9b-it',
} as const;

// =============================================================================
// CLIENT
// =============================================================================

/**
 * Get Groq API key from environment
 */
function getApiKey(): string {
  const key = process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error('GROQ_API_KEY is not configured. Add it to .env.local');
  }
  return key;
}

/**
 * Send chat completion request to Groq
 */
export async function groqChat(
  messages: GroqMessage[],
  config: GroqConfig = {}
): Promise<string> {
  const {
    model = GROQ_MODELS.LLAMA_70B,
    maxTokens = 1024,
    temperature = 0.7,
    topP = 0.9,
  } = config;

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errorText}`);
  }

  const data: GroqResponse = await response.json();

  if (!data.choices || data.choices.length === 0) {
    throw new Error('Empty response from Groq');
  }

  return data.choices[0].message.content;
}

/**
 * Simple text completion with system prompt
 */
export async function groqComplete(
  systemPrompt: string,
  userPrompt: string,
  config?: GroqConfig
): Promise<string> {
  return groqChat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], config);
}

/**
 * Generate property description in Czech
 */
export async function generatePropertyDescription(property: {
  title: string;
  type: string;
  price: number;
  area: number;
  city: string;
  features?: string[];
}): Promise<string> {
  const systemPrompt = `Jsi expertní realitní copywriter. Piš emotivní, luxusní popisy nemovitostí v češtině.
Délka: 180-220 slov. Žádné odrážky, žádné nadpisy. Prodávej životní styl, ne jen nemovitost.`;

  const userPrompt = `Napiš popis pro: ${property.title}
Typ: ${property.type}
Cena: ${property.price.toLocaleString('cs-CZ')} Kč
Plocha: ${property.area} m²
Lokalita: ${property.city}
${property.features ? `Vybavení: ${property.features.join(', ')}` : ''}`;

  return groqComplete(systemPrompt, userPrompt, {
    temperature: 0.8,
    maxTokens: 500,
  });
}

/**
 * Parse voice search query to structured filters
 */
export async function parseVoiceQuery(query: string): Promise<{
  type?: string;
  rooms?: number;
  city?: string;
  maxPrice?: number;
  minArea?: number;
}> {
  const systemPrompt = `Analyzuj český hlasový dotaz na nemovitosti a extrahuj filtry.
Vrať POUZE JSON bez markdown, bez vysvětlení.
Příklad vstupu: "Hledám tří plus jedna v Brně do pěti milionů"
Příklad výstupu: {"rooms":4,"city":"Brno","maxPrice":5000000}`;

  const result = await groqComplete(systemPrompt, query, {
    model: GROQ_MODELS.LLAMA_8B, // Faster for simple tasks
    temperature: 0.1, // More deterministic
    maxTokens: 200,
  });

  try {
    // Remove any markdown formatting
    const jsonStr = result.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch {
    console.error('Failed to parse voice query result:', result);
    return {};
  }
}

/**
 * Check if Groq is configured
 */
export function isGroqConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY);
}
