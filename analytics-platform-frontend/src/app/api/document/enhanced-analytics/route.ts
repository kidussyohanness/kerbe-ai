import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const documentType = formData.get('documentType');
    const businessContext = formData.get('businessContext');

    if (!file || !(file instanceof Blob) || !documentType) {
      return NextResponse.json({ success: false, error: 'File and documentType are required' }, { status: 400 });
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8787';
    const backendFormData = new FormData();
    backendFormData.append('file', file, (file as File).name);
    backendFormData.append('documentType', documentType.toString());
    
    if (businessContext) {
      backendFormData.append('businessContext', businessContext.toString());
    }

    // Add timeout and abort controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

    try {
      const response = await fetch(`${backendUrl}/document/enhanced-analytics`, {
        method: 'POST',
        body: backendFormData,
        signal: controller.signal,
        headers: {
          'Connection': 'keep-alive',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        return NextResponse.json({ success: false, error: errorData.error || 'Backend enhanced analysis failed' }, { status: response.status });
      }

      const data = await response.json();
      return NextResponse.json({ success: true, data });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        return NextResponse.json({ 
          success: false, 
          error: 'Analysis timeout - the document is too large or complex. Please try a smaller file or contact support.' 
        }, { status: 408 });
      }
      
      throw fetchError;
    }
  } catch (error: any) {
    console.error('Error in enhanced document analytics API route:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
