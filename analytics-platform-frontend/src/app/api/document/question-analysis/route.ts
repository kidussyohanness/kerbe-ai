import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;
    const businessContext = formData.get('businessContext') as string;
    const questionsJson = formData.get('questions') as string;
    
    if (!file || !documentType || !questionsJson) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert file to buffer for backend
    const fileBuffer = await file.arrayBuffer();
    const fileContent = Buffer.from(fileBuffer);
    
    // Create form data for backend
    const backendFormData = new FormData();
    backendFormData.append('file', new Blob([fileContent]), file.name);
    backendFormData.append('documentType', documentType);
    backendFormData.append('businessContext', businessContext || '');
    backendFormData.append('questions', questionsJson);

    // Send to backend with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

    try {
      const backendResponse = await fetch('http://localhost:8787/document/question-analysis', {
        method: 'POST',
        body: backendFormData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!backendResponse.ok) {
        if (backendResponse.status === 408) {
          return NextResponse.json(
            { success: false, error: 'Analysis timed out. Please try with a smaller document.' },
            { status: 408 }
          );
        }
        throw new Error(`Backend error: ${backendResponse.statusText}`);
      }

      const result = await backendResponse.json();
      
      return NextResponse.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        return NextResponse.json(
          { success: false, error: 'Analysis timed out. Please try with a smaller document.' },
          { status: 408 }
        );
      }
      throw error;
    }

  } catch (error) {
    console.error('Question analysis error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Analysis failed' 
      },
      { status: 500 }
    );
  }
}
