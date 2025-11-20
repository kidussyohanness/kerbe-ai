import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { readFile, unlink } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const document = await prisma.userDocument.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      },
      include: {
        folder: true,
        analyses: {
          select: {
            id: true,
            analysisType: true,
            createdAt: true,
            confidence: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        },
        versions: {
          select: {
            id: true,
            version: true,
            createdAt: true,
            status: true
          },
          orderBy: {
            version: 'desc'
          }
        }
      }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const formattedDocument = {
      id: document.id,
      filename: document.filename,
      originalName: document.originalName,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      documentType: document.documentType,
      status: document.status,
      processingProgress: document.processingProgress,
      processingError: document.processingError,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      description: document.description,
      tags: document.tags ? JSON.parse(document.tags) : [],
      folder: document.folder,
      version: document.version,
      accessLevel: document.accessLevel,
      analysisResults: document.analysisResults,
      extractedData: document.extractedData,
      recentAnalyses: document.analyses,
      versions: document.versions
    };

    return NextResponse.json({
      success: true,
      document: formattedDocument
    });

  } catch (error) {
    console.error('Get document error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      description, 
      tags, 
      folderId, 
      documentType,
      accessLevel 
    } = body;

    const document = await prisma.userDocument.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const updatedDocument = await prisma.userDocument.update({
      where: { id: params.id },
      data: {
        ...(description !== undefined && { description }),
        ...(tags !== undefined && { tags: JSON.stringify(tags) }),
        ...(folderId !== undefined && { folderId }),
        ...(documentType !== undefined && { documentType }),
        ...(accessLevel !== undefined && { accessLevel })
      },
      include: {
        folder: true
      }
    });

    // Log activity
    await prisma.userActivityLog.create({
      data: {
        userId: session.user.id,
        activityType: 'update',
        description: `Updated document: ${document.originalName}`,
        metadata: JSON.stringify({
          documentId: params.id,
          changes: Object.keys(body)
        })
      }
    });

    return NextResponse.json({
      success: true,
      document: {
        id: updatedDocument.id,
        filename: updatedDocument.filename,
        originalName: updatedDocument.originalName,
        description: updatedDocument.description,
        tags: updatedDocument.tags ? JSON.parse(updatedDocument.tags) : [],
        folder: updatedDocument.folder,
        accessLevel: updatedDocument.accessLevel,
        updatedAt: updatedDocument.updatedAt
      }
    });

  } catch (error) {
    console.error('Update document error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const document = await prisma.userDocument.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Delete physical file
    if (document.filePath) {
      try {
        await unlink(document.filePath);
      } catch (error) {
        console.warn('Could not delete physical file:', error);
      }
    }

    // Delete from database
    await prisma.userDocument.delete({
      where: { id: params.id }
    });

    // Update user storage usage
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        storageUsed: {
          decrement: document.fileSize
        }
      }
    });

    // Log activity
    await prisma.userActivityLog.create({
      data: {
        userId: session.user.id,
        activityType: 'delete',
        description: `Deleted document: ${document.originalName}`,
        metadata: JSON.stringify({
          documentId: params.id,
          fileSize: document.fileSize
        })
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Delete document error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
