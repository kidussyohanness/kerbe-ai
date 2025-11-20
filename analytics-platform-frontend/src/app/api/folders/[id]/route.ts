import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const folder = await prisma.userFolder.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      },
      include: {
        documents: {
          include: {
            _count: {
              select: {
                analyses: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        subfolders: {
          include: {
            _count: {
              select: {
                documents: true
              }
            }
          },
          orderBy: {
            name: 'asc'
          }
        },
        parentFolder: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    const formattedDocuments = folder.documents.map(doc => ({
      id: doc.id,
      filename: doc.filename,
      originalName: doc.originalName,
      fileSize: doc.fileSize,
      mimeType: doc.mimeType,
      documentType: doc.documentType,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      description: doc.description,
      tags: doc.tags ? JSON.parse(doc.tags) : [],
      analysisCount: doc._count.analyses
    }));

    const formattedSubfolders = folder.subfolders.map(subfolder => ({
      id: subfolder.id,
      name: subfolder.name,
      description: subfolder.description,
      color: subfolder.color,
      icon: subfolder.icon,
      documentCount: subfolder._count.documents,
      createdAt: subfolder.createdAt
    }));

    return NextResponse.json({
      success: true,
      folder: {
        id: folder.id,
        name: folder.name,
        description: folder.description,
        parentFolderId: folder.parentFolderId,
        parentFolder: folder.parentFolder,
        color: folder.color,
        icon: folder.icon,
        isShared: folder.isShared,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
        documents: formattedDocuments,
        subfolders: formattedSubfolders
      }
    });

  } catch (error) {
    console.error('Get folder error:', error);
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
      name, 
      description, 
      parentFolderId, 
      color, 
      icon 
    } = body;

    const folder = await prisma.userFolder.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    // Check if new parent folder exists and belongs to user
    if (parentFolderId && parentFolderId !== folder.parentFolderId) {
      const parentFolder = await prisma.userFolder.findFirst({
        where: {
          id: parentFolderId,
          userId: session.user.id
        }
      });

      if (!parentFolder) {
        return NextResponse.json({ 
          error: 'Parent folder not found' 
        }, { status: 404 });
      }

      // Prevent circular references
      if (parentFolderId === params.id) {
        return NextResponse.json({ 
          error: 'Folder cannot be its own parent' 
        }, { status: 400 });
      }
    }

    // Check for duplicate folder name in the same parent
    if (name && name !== folder.name) {
      const existingFolder = await prisma.userFolder.findFirst({
        where: {
          userId: session.user.id,
          name: name.trim(),
          parentFolderId: parentFolderId !== undefined ? parentFolderId : folder.parentFolderId,
          id: { not: params.id }
        }
      });

      if (existingFolder) {
        return NextResponse.json({ 
          error: 'Folder with this name already exists' 
        }, { status: 409 });
      }
    }

    const updatedFolder = await prisma.userFolder.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description }),
        ...(parentFolderId !== undefined && { parentFolderId }),
        ...(color !== undefined && { color }),
        ...(icon !== undefined && { icon })
      }
    });

    // Log activity
    await prisma.userActivityLog.create({
      data: {
        userId: session.user.id,
        activityType: 'update_folder',
        description: `Updated folder: ${updatedFolder.name}`,
        metadata: JSON.stringify({
          folderId: params.id,
          changes: Object.keys(body)
        })
      }
    });

    return NextResponse.json({
      success: true,
      folder: {
        id: updatedFolder.id,
        name: updatedFolder.name,
        description: updatedFolder.description,
        parentFolderId: updatedFolder.parentFolderId,
        color: updatedFolder.color,
        icon: updatedFolder.icon,
        updatedAt: updatedFolder.updatedAt
      }
    });

  } catch (error) {
    console.error('Update folder error:', error);
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

    const folder = await prisma.userFolder.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      },
      include: {
        _count: {
          select: {
            documents: true,
            subfolders: true
          }
        }
      }
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    // Check if folder has contents
    if (folder._count.documents > 0 || folder._count.subfolders > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete folder with contents. Please move or delete all files and subfolders first.' 
      }, { status: 400 });
    }

    // Delete folder
    await prisma.userFolder.delete({
      where: { id: params.id }
    });

    // Log activity
    await prisma.userActivityLog.create({
      data: {
        userId: session.user.id,
        activityType: 'delete_folder',
        description: `Deleted folder: ${folder.name}`,
        metadata: JSON.stringify({
          folderId: params.id
        })
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Folder deleted successfully'
    });

  } catch (error) {
    console.error('Delete folder error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
