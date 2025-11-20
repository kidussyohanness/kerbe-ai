import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';
import { existsSync } from 'fs';

// Configuration
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'text/csv',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/json'
];

const UPLOAD_DIR = join(process.cwd(), 'uploads');

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureUploadDir();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;
    const description = formData.get('description') as string;
    const folderId = formData.get('folderId') as string;
    const tags = formData.get('tags') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` 
      }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'File type not allowed' 
      }, { status: 400 });
    }

    // Generate file hash for deduplication
    const fileBuffer = await file.arrayBuffer();
    const fileHash = createHash('sha256').update(Buffer.from(fileBuffer)).digest('hex');

    // Check for duplicate files
    const existingFile = await prisma.userDocument.findFirst({
      where: {
        userId: session.user.id,
        fileHash,
        status: { not: 'archived' }
      }
    });

    if (existingFile) {
      return NextResponse.json({ 
        error: 'File already exists',
        documentId: existingFile.id,
        existing: true
      }, { status: 409 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const filename = `${timestamp}_${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const filePath = join(UPLOAD_DIR, session.user.id, filename);

    // Create user directory if it doesn't exist
    const userDir = join(UPLOAD_DIR, session.user.id);
    if (!existsSync(userDir)) {
      await mkdir(userDir, { recursive: true });
    }

    // Save file to disk
    await writeFile(filePath, Buffer.from(fileBuffer));

    // Create database record
    const document = await prisma.userDocument.create({
      data: {
        userId: session.user.id,
        filename,
        originalName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        documentType: documentType || 'general',
        filePath,
        fileHash,
        description: description || null,
        folderId: folderId || null,
        tags: tags || null,
        status: 'uploaded',
        storageProvider: 'local',
        processingProgress: 0
      },
      include: {
        folder: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Log activity
    await prisma.userActivityLog.create({
      data: {
        userId: session.user.id,
        activityType: 'upload',
        description: `Uploaded file: ${file.name}`,
        metadata: JSON.stringify({
          fileSize: file.size,
          mimeType: file.type,
          documentType: documentType || 'general'
        })
      }
    });

    // Update user storage usage
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        storageUsed: {
          increment: file.size
        }
      }
    });

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        filename: document.filename,
        originalName: document.originalName,
        fileSize: document.fileSize,
        mimeType: document.mimeType,
        documentType: document.documentType,
        status: document.status,
        createdAt: document.createdAt,
        description: document.description,
        folder: document.folder,
        tags: document.tags ? JSON.parse(document.tags) : []
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
