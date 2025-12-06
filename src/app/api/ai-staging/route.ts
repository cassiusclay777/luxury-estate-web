import { NextRequest, NextResponse } from 'next/server';
import { generateStagedRoom, validateHuggingFaceConfig } from '@/lib/huggingfaceClient';
import { getFullImageUrl } from '@/lib/uploadHandler';
import { InteriorStyle, StagingLog } from '@/lib/types/ai-staging';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

/**
 * POST /api/ai-staging
 * Generate virtually staged room image
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Validate Hugging Face API is configured
    if (!validateHuggingFaceConfig()) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI služba není nakonfigurována. Nastavte HUGGINGFACE_API_TOKEN v .env.local'
        },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { imageUrl, style, prompt, propertyId } = body;

    // Validate required fields
    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Chybí URL obrázku' },
        { status: 400 }
      );
    }

    if (!style) {
      return NextResponse.json(
        { success: false, error: 'Chybí výběr stylu' },
        { status: 400 }
      );
    }

    // Validate style
    const validStyles: InteriorStyle[] = [
      'modern', 'minimalist', 'industrial', 'scandinavian',
      'classic', 'loft', 'rustic', 'contemporary'
    ];
    if (!validStyles.includes(style as InteriorStyle)) {
      return NextResponse.json(
        { success: false, error: 'Neplatný styl' },
        { status: 400 }
      );
    }

    console.log('Processing AI staging request...');
    console.log('Image URL:', imageUrl);
    console.log('Style:', style);
    console.log('Prompt:', prompt || 'none');

    // Convert relative URL to full URL if needed
    const fullImageUrl = getFullImageUrl(imageUrl);

    // Generate staged room using AI
    const result = await generateStagedRoom({
      imageUrl: fullImageUrl,
      style: style as InteriorStyle,
      prompt,
    });

    const processingTime = Date.now() - startTime;

    // Log the request (admin hook)
    await logStagingRequest({
      originalImageUrl: imageUrl,
      generatedImageUrl: result.imageUrl,
      style: style as InteriorStyle,
      prompt,
      propertyId,
      processingTime,
    });

    // Return success response
    return NextResponse.json({
      success: true,
      imageUrl: result.imageUrl,
      metadata: {
        requestId: generateRequestId(),
        timestamp: new Date().toISOString(),
        processingTime,
      },
    });

  } catch (error) {
    console.error('AI Staging error:', error);

    const processingTime = Date.now() - startTime;

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Neočekávaná chyba při generování',
        metadata: {
          requestId: generateRequestId(),
          timestamp: new Date().toISOString(),
          processingTime,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Log staging request for admin tracking
 * Saves to data/staging-logs.json
 */
async function logStagingRequest(data: {
  originalImageUrl: string;
  generatedImageUrl: string;
  style: InteriorStyle;
  prompt?: string;
  propertyId?: string;
  processingTime: number;
}) {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const logFile = path.join(dataDir, 'staging-logs.json');

    // Create data directory if it doesn't exist
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true });
    }

    // Read existing logs
    let logs: StagingLog[] = [];
    if (existsSync(logFile)) {
      const fileContent = await require('fs/promises').readFile(logFile, 'utf-8');
      logs = JSON.parse(fileContent);
    }

    // Add new log
    const newLog: StagingLog = {
      id: generateRequestId(),
      timestamp: new Date().toISOString(),
      originalImageUrl: data.originalImageUrl,
      generatedImageUrl: data.generatedImageUrl,
      style: data.style,
      prompt: data.prompt,
      propertyId: data.propertyId,
    };

    logs.push(newLog);

    // Keep only last 1000 logs to prevent file bloat
    if (logs.length > 1000) {
      logs = logs.slice(-1000);
    }

    // Save logs
    await writeFile(logFile, JSON.stringify(logs, null, 2));

    console.log('Staging request logged:', newLog.id);
  } catch (error) {
    console.error('Error logging staging request:', error);
    // Don't throw - logging failure shouldn't break the main flow
  }
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `staging_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

// Allow longer timeout for AI operations (Vercel Pro: 60s, Hobby: 10s)
export const maxDuration = 60;
