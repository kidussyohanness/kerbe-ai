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

    const folders = await prisma.userFolder.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: {
            documents: true,
            subfolders: true
          }
        },
        subfolders: {
          include: {
            _count: {
              select: {
                documents: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    const formattedFolders = folders.map(folder => ({
      id: folder.id,
      name: folder.name,
      description: folder.description,
      parentFolderId: folder.parentFolderId,
      color: folder.color,
      icon: folder.icon,
      isShared: folder.isShared,
      documentCount: folder._count.documents,
      subfolderCount: folder._count.subfolders,
      subfolders: folder.subfolders.map(subfolder => ({
        id: subfolder.id,
        name: subfolder.name,
        documentCount: subfolder._count.documents,
        color: subfolder.color
      })),
      createdAt: folder.createdAt,
      updatedAt: folder.updatedAt
    }));

    return NextResponse.json({
      success: true,
      folders: formattedFolders
    });

  } catch (error) {
    console.error('Get folders error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Folder name is required' 
      }, { status: 400 });
    }

    // Check if parent folder exists and belongs to user
    if (parentFolderId) {
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
    }

    // Check for duplicate folder name in the same parent
    const existingFolder = await prisma.userFolder.findFirst({
      where: {
        userId: session.user.id,
        name: name.trim(),
        parentFolderId: parentFolderId || null
      }
    });

    if (existingFolder) {
      return NextResponse.json({ 
        error: 'Folder with this name already exists' 
      }, { status: 409 });
    }

    const folder = await prisma.userFolder.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        description: description || null,
        parentFolderId: parentFolderId || null,
        color: color || null,
        icon: icon || null
      }
    });

    // Log activity
    await prisma.userActivityLog.create({
      data: {
        userId: session.user.id,
        activityType: 'create_folder',
        description: `Created folder: ${name}`,
        metadata: JSON.stringify({
          folderId: folder.id,
          parentFolderId: parentFolderId || null
        })
      }
    });

    return NextResponse.json({
      success: true,
      folder: {
        id: folder.id,
        name: folder.name,
        description: folder.description,
        parentFolderId: folder.parentFolderId,
        color: folder.color,
        icon: folder.icon,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt
      }
    });

  } catch (error) {
    console.error('Create folder error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
