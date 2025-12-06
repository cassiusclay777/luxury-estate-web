/**
 * =============================================================================
 * AI PROPERTY DESCRIPTION GENERATOR - GROQ LLAMA 3.1 70B
 * =============================================================================
 * Generates sexy, emotional property descriptions in Czech
 * Ultra-fast: 150+ tokens/second with Groq
 * 
 * @author LuxEstate Team 2025
 * @license MIT
 */

import { NextRequest, NextResponse } from 'next/server';

// =============================================================================
// TYPES
// =============================================================================

interface DescriptionRequest {
  title: string;
  type: string;
  price: number;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  city: string;
  address?: string;
  features?: string[];
  yearBuilt?: number;
}

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    total_tokens: number;
  };
}

// =============================================================================
// GROQ CLIENT
// =============================================================================

async function generateWithGroq(
  messages: GroqMessage[],
  maxTokens: number = 500
): Promise<string> {
  const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY;
  
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-70b-versatile',
      messages,
      max_tokens: maxTokens,
      temperature: 0.8, // Creative but not crazy
      top_p: 0.9,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${error}`);
  }

  const data: GroqResponse = await response.json();
  
  if (!data.choices || data.choices.length === 0) {
    throw new Error('No response from Groq');
  }

  return data.choices[0].message.content;
}

// =============================================================================
// SYSTEM PROMPT
// =============================================================================

const SYSTEM_PROMPT = `Jsi expertní realitní copywriter pro luxusní české nemovitosti. Píšeš prodejní texty, které:

1. STYL: Emotivní, elegantní, aspirační. Jako nejlepší luxury real estate marketing.
2. DÉLKA: Přesně 180-220 slov. Ani více, ani méně.
3. STRUKTURA: 
   - Úvodní věta s "wow" faktorem (bez nadpisu)
   - 2-3 odstavce popisující prostor, atmosféru, životní styl
   - Závěrečná věta s výzvou k akci
4. JAZYK: Čeština, ale můžeš použít 1-2 anglické výrazy (open space, penthouse, smart home)
5. TRIK: Prodávej ŽIVOTNÍ STYL, ne jen nemovitost
6. LOKALIZACE: Zmiň specifika lokality (Praha = prestižní čtvrti, Brno = dynamické město, atd.)

NIKDY nepoužívej:
- Generické fráze jako "ideální pro rodiny"
- Seznamy s odrážkami
- Nadpisy nebo formátování
- Slovo "nabízíme" nebo "představujeme"

Piš jako bys psal pro Architectural Digest nebo Christie's Real Estate.`;

// =============================================================================
// API ROUTES
// =============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: DescriptionRequest = await request.json();
    const { title, type, price, area, bedrooms, bathrooms, city, address, features, yearBuilt } = body;

    // Validate required fields
    if (!title || !type || !price || !area || !city) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, type, price, area, city' },
        { status: 400 }
      );
    }

    // Format price for prompt
    const formattedPrice = new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      maximumFractionDigits: 0,
    }).format(price);

    // Build user prompt with all available data
    const propertyInfo = [
      `Název: ${title}`,
      `Typ: ${type}`,
      `Cena: ${formattedPrice}`,
      `Plocha: ${area} m²`,
      bedrooms ? `Pokoje: ${bedrooms}` : null,
      bathrooms ? `Koupelny: ${bathrooms}` : null,
      `Lokalita: ${city}${address ? `, ${address}` : ''}`,
      yearBuilt ? `Rok výstavby: ${yearBuilt}` : null,
      features && features.length > 0 ? `Vybavení: ${features.join(', ')}` : null,
    ].filter(Boolean).join('\n');

    const userPrompt = `Napiš prodejní popis pro tuto nemovitost:\n\n${propertyInfo}\n\nPamatuj: 180-220 slov, emotivní, žádné odrážky, žádné nadpisy.`;

    // Generate with Groq
    const description = await generateWithGroq([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ]);

    const duration = Date.now() - startTime;
    const wordCount = description.split(/\s+/).length;

    console.log(`[AI Description] Generated ${wordCount} words in ${duration}ms`);

    return NextResponse.json({
      success: true,
      description: description.trim(),
      metadata: {
        wordCount,
        duration,
        model: 'llama-3.1-70b-versatile',
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('[AI Description] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/** GET: Health check and info */
export async function GET() {
  const hasGroq = !!(process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY);
  
  return NextResponse.json({
    available: hasGroq,
    model: 'llama-3.1-70b-versatile',
    provider: 'Groq',
    speed: '~150 tokens/sec',
    language: 'Czech',
    wordRange: '180-220 words',
  });
}

export const runtime = 'nodejs';
export const maxDuration = 30;
