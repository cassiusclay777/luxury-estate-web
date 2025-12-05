import { NextRequest, NextResponse } from 'next/server';
import { saveUploadedFile, validateImageFile } from '@/lib/uploadHandler';

/**
 * POST /api/ai-staging/upload
 * Upload image file for virtual staging
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Není nahrán žádný soubor' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Save file to public/uploads
    const { url } = await saveUploadedFile(file);

    return NextResponse.json({
      success: true,
      url,
      message: 'Soubor byl úspěšně nahrán',
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Chyba při nahrávání souboru'
      },
      { status: 500 }
    );
  }
}
