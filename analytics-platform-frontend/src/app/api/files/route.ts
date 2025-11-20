import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const documentType = searchParams.get('type');
    const folderId = searchParams.get('folderId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId: session.user.id,
      status: { not: 'archived' }
    };

    if (documentType) {
      where.documentType = documentType;
    }

    if (folderId) {
      where.folderId = folderId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { originalName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get documents with pagination
    const [documents, totalCount] = await Promise.all([
      prisma.userDocument.findMany({
        where,
        include: {
          folder: {
            select: {
              id: true,
              name: true,
              color: true
            }
          },
          _count: {
            select: {
              analyses: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: limit
      }),
      prisma.userDocument.count({ where })
    ]);

    // Get storage statistics
    const storageStats = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        storageUsed: true,
        storageQuota: true
      }
    });

    // Get folder statistics
    const folderStats = await prisma.userFolder.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: {
            documents: true
          }
        }
      }
    });

    // Get document type statistics
    const documentTypeStats = await prisma.userDocument.groupBy({
      by: ['documentType'],
      where: {
        userId: session.user.id,
        status: { not: 'archived' }
      },
      _count: {
        documentType: true
      }
    });

    const formattedDocuments = documents.map(doc => ({
      id: doc.id,
      filename: doc.filename,
      originalName: doc.originalName,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      documentType: doc.documentType,
      status: doc.status,
      processingProgress: doc.processingProgress,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      description: doc.description,
      tags: doc.tags ? JSON.parse(doc.tags) : [],
      folder: doc.folder,
      analysisCount: doc._count.analyses,
      version: doc.version,
      accessLevel: doc.accessLevel
    }));

    return NextResponse.json({
      success: true,
      documents: formattedDocuments,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      statistics: {
        storage: {
          used: storageStats?.storageUsed || 0,
          quota: storageStats?.storageQuota || 0,
          usagePercentage: storageStats ? 
            Math.round((Number(storageStats.storageUsed) / Number(storageStats.storageQuota)) * 100) : 0
        },
        folders: folderStats.map(folder => ({
          id: folder.id,
          name: folder.name,
          documentCount: folder._count.documents,
          color: folder.color
        })),
        documentTypes: documentTypeStats.map(stat => ({
          type: stat.documentType,
          count: stat._count.documentType
        }))
      }
    });

  } catch (error) {
    console.error('Get files error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
