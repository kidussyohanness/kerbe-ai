#!/usr/bin/env node

/**
 * Fix User Documents - Migrate documents to correct userId
 * This script helps fix the issue where documents were saved with inconsistent userIds
 */

// Use backend Prisma client
const path = require('path');
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./analytics-platform-backend/prisma/dev.db';

const { PrismaClient } = require(path.join(__dirname, 'analytics-platform-backend/node_modules/@prisma/client'));
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function fixUserDocuments() {
  console.log('🔍 Analyzing User Document Storage Issue\n');
  console.log('='.repeat(80));
  
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        googleId: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`\n📊 Found ${users.length} users in database:\n`);
    users.forEach((user, idx) => {
      console.log(`${idx + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log(`   Google ID: ${user.googleId || 'N/A'}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });
    
    // Get all documents grouped by userId
    const documentsByUser = await prisma.userDocument.groupBy({
      by: ['userId'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });
    
    console.log(`\n📄 Found ${documentsByUser.length} unique userIds with documents:\n`);
    documentsByUser.forEach((group, idx) => {
      console.log(`${idx + 1}. userId: ${group.userId}`);
      console.log(`   Document count: ${group._count.id}`);
      
      // Check if this userId exists as a User
      const userExists = users.find(u => u.id === group.userId);
      if (userExists) {
        console.log(`   ✅ User exists: ${userExists.email || userExists.name || 'N/A'}`);
      } else {
        console.log(`   ❌ User NOT found in database!`);
        
        // Try to find user by email pattern
        if (group.userId.startsWith('user_')) {
          const emailPattern = group.userId.replace('user_', '').replace(/_/g, '.');
          const matchingUser = users.find(u => u.email && u.email.includes(emailPattern));
          if (matchingUser) {
            console.log(`   💡 Possible match: ${matchingUser.email} (ID: ${matchingUser.id})`);
          }
        }
      }
      console.log('');
    });
    
    // Get all chat messages grouped by userId
    const chatByUser = await prisma.chatMessage.groupBy({
      by: ['userId'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });
    
    console.log(`\n💬 Found ${chatByUser.length} unique userIds with chat messages:\n`);
    chatByUser.forEach((group, idx) => {
      console.log(`${idx + 1}. userId: ${group.userId}`);
      console.log(`   Message count: ${group._count.id}`);
      
      const userExists = users.find(u => u.id === group.userId);
      if (userExists) {
        console.log(`   ✅ User exists: ${userExists.email || userExists.name || 'N/A'}`);
      } else {
        console.log(`   ❌ User NOT found in database!`);
      }
      console.log('');
    });
    
    // Find orphaned documents (documents with userId that doesn't exist)
    const allDocuments = await prisma.userDocument.findMany({
      select: {
        id: true,
        userId: true,
        originalName: true,
        createdAt: true
      }
    });
    
    const orphanedDocs = allDocuments.filter(doc => 
      !users.find(u => u.id === doc.userId)
    );
    
    if (orphanedDocs.length > 0) {
      console.log(`\n⚠️  Found ${orphanedDocs.length} orphaned documents (userId doesn't exist):\n`);
      orphanedDocs.forEach((doc, idx) => {
        console.log(`${idx + 1}. Document: ${doc.originalName}`);
        console.log(`   userId: ${doc.userId}`);
        console.log(`   Created: ${doc.createdAt}`);
        console.log('');
      });
      
      console.log('\n💡 Recommendation:');
      console.log('   These documents need to be migrated to a valid userId.');
      console.log('   After you sign in again, a User record will be created.');
      console.log('   Then we can migrate these documents to your new userId.\n');
    } else {
      console.log('\n✅ All documents have valid userIds!\n');
    }
    
    // Summary
    console.log('='.repeat(80));
    console.log('📊 SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Users: ${users.length}`);
    console.log(`Total Documents: ${allDocuments.length}`);
    console.log(`Orphaned Documents: ${orphanedDocs.length}`);
    console.log(`Total Chat Messages: ${chatByUser.reduce((sum, g) => sum + g._count.id, 0)}`);
    console.log('');
    
    if (orphanedDocs.length > 0) {
      console.log('🔧 NEXT STEPS:');
      console.log('1. Sign in again to create/update your User record');
      console.log('2. Run this script again to see your new userId');
      console.log('3. We can then migrate your documents to the correct userId');
      console.log('');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserDocuments();

