import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true // For client-side usage in development
});

// System prompt for real estate assistant
const SYSTEM_PROMPT = `Jsi LuxEstate AI Assistant, expert na realitní trh v České republice.
Tvé hlavní úkoly:
1. Pomáhat uživatelům najít ideální nemovitost na základě jejich požadavků
2. Poskytovat informace o realitním trhu, cenových trendech a lokalitách
3. Vysvětlovat realitní terminologii a procesy
4. Doporučovat vhodné nemovitosti z naší databáze

Pravidla:
- Buď přátelský, profesionální a nápomocný
- Odpovídej stručně a konkrétně
- Pokud nemáš dost informací, řekni to a nabídni pomoc s vyhledáváním
- Nikdy nedávej finanční nebo právní rady
- Odkazuj na konkrétní nemovitosti pomocí ID nebo parametrů
- Používej český jazyk s profesionálním tónem

Formát odpovědí:
- Stručný úvod
- Hlavní body s odrážkami
- Závěr s doporučením dalšího kroku`;

// Types
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface PropertyRecommendation {
  id: string;
  title: string;
  price: number;
  address: string;
  city: string;
  matchScore: number;
  reasoning: string;
}

// Main chat function
export async function chatWithAI(
  messages: ChatMessage[],
  propertyContext?: any[]
): Promise<{ response: string; recommendations?: PropertyRecommendation[] }> {
  try {
    // Prepare messages with system prompt
    const chatMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // Add property context if available
    if (propertyContext && propertyContext.length > 0) {
      const contextMessage = `\n\nDostupné nemovitosti (${propertyContext.length}):\n${propertyContext
        .slice(0, 5)
        .map((prop: any, i: number) => 
          `${i + 1}. ${prop.title} - ${prop.price.toLocaleString()} Kč, ${prop.city} (${prop.bedrooms || '?'}+${prop.bathrooms || '?'})`
        )
        .join('\n')}`;
      
      chatMessages.push({
        role: 'system',
        content: `Aktuální nabídka nemovitostí:${contextMessage}`
      });
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || 'Omlouvám se, nemohu nyní odpovědět.';

    // Generate recommendations if property context is available
    let recommendations: PropertyRecommendation[] = [];
    if (propertyContext && propertyContext.length > 0) {
      recommendations = generateRecommendations(messages[messages.length - 1]?.content || '', propertyContext);
    }

    return { response, recommendations: recommendations.length > 0 ? recommendations : undefined };
  } catch (error) {
    console.error('OpenAI API error:', error);
    return { 
      response: 'Omlouvám se, došlo k technické chybě. Zkuste to prosím později nebo kontaktujte podporu.' 
    };
  }
}

// Generate property recommendations based on user query
function generateRecommendations(
  userQuery: string,
  properties: any[]
): PropertyRecommendation[] {
  // Simple keyword matching for demo
  // In production, this would use embeddings and semantic search
  const query = userQuery.toLowerCase();
  
  const scoredProperties = properties.map(prop => {
    let score = 0;
    
    // Price matching (simplified)
    const priceMatch = query.match(/(\d+)\s*(milion|m|kč|tisíc)/i);
    if (priceMatch) {
      const requestedPrice = parseInt(priceMatch[1]) * (priceMatch[2].toLowerCase().includes('m') ? 1000000 : 1000);
      const priceDiff = Math.abs(prop.price - requestedPrice);
      if (priceDiff < 1000000) score += 30;
    }
    
    // Location matching
    if (query.includes(prop.city.toLowerCase())) score += 40;
    
    // Type matching
    if (query.includes('byt') && prop.property_type?.toLowerCase().includes('byt')) score += 20;
    if (query.includes('dům') && prop.property_type?.toLowerCase().includes('dům')) score += 20;
    if (query.includes('vila') && prop.property_type?.toLowerCase().includes('vila')) score += 20;
    
    // Size matching
    if (query.includes('1+kk') && prop.bedrooms === 1) score += 15;
    if (query.includes('2+kk') && prop.bedrooms === 2) score += 15;
    if (query.includes('3+kk') && prop.bedrooms === 3) score += 15;
    if (query.includes('4+kk') && prop.bedrooms === 4) score += 15;
    
    return {
      id: prop.id,
      title: prop.title,
      price: prop.price,
      address: prop.address,
      city: prop.city,
      matchScore: Math.min(score, 100),
      reasoning: getReasoning(score, prop)
    };
  });
  
  // Sort by score and return top 3
  return scoredProperties
    .filter(p => p.matchScore > 20)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);
}

function getReasoning(score: number, prop: any): string {
  if (score > 70) return 'Vysoká shoda s vašimi požadavky';
  if (score > 50) return 'Dobrá shoda s většinou požadavků';
  if (score > 30) return 'Částečná shoda s vašimi požadavky';
  return 'Možná alternativa k zvážení';
}

// Price prediction function (simplified demo)
export async function predictPropertyPrice(
  features: {
    city: string;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    propertyType: string;
  }
): Promise<{ minPrice: number; maxPrice: number; confidence: number; reasoning: string }> {
  // This is a simplified demo version
  // In production, this would use a trained ML model
  
  const basePrices: Record<string, number> = {
    'Praha': 80000,
    'Brno': 60000,
    'Ostrava': 40000,
    'Plzeň': 45000,
    'Liberec': 35000,
  };
  
  const basePrice = basePrices[features.city] || 30000;
  const estimatedPrice = basePrice * features.sqft;
  
  // Add adjustments
  let adjustedPrice = estimatedPrice;
  adjustedPrice *= (1 + (features.bedrooms - 2) * 0.1); // +10% per bedroom above 2
  adjustedPrice *= (1 + (features.bathrooms - 1) * 0.15); // +15% per bathroom above 1
  
  if (features.propertyType.includes('vila')) adjustedPrice *= 1.3;
  if (features.propertyType.includes('penthouse')) adjustedPrice *= 1.5;
  
  const variance = 0.15; // 15% variance
  const minPrice = Math.round(adjustedPrice * (1 - variance));
  const maxPrice = Math.round(adjustedPrice * (1 + variance));
  
  return {
    minPrice,
    maxPrice,
    confidence: 0.75, // 75% confidence for demo
    reasoning: `Odhad na základě tržních dat pro ${features.city}, ${features.bedrooms} pokoje, ${features.sqft} m²`
  };
}
