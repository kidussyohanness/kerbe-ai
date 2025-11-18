#!/usr/bin/env node

/**
 * Migrate Documents to Google User
 * Links documents from test userIds to your actual Google account
 */

const path = require('path');
const { PrismaClient } = require(path.join(__dirname, 'analytics-platform-backend/node_modules/@prisma/client'));

process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:' + path.join(__dirname, 'analytics-platform-backend/prisma/dev.db');
const prisma = new PrismaClient();

async function migrateDocuments() {
  console.log('🔄 Migrating Documents to Google User\n');
  console.log('='.repeat(80));
  
  try {
    // Get all users
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`\n👥 Users Found:\n`);
    users.forEach((user, idx) => {
      const isGoogleUser = !!user.googleId;
      console.log(`${idx + 1}. ${user.email || 'N/A'}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Google ID: ${user.googleId || 'N/A'}`);
      console.log(`   Type: ${isGoogleUser ? '✅ Google User' : '⚠️  Test User'}`);
      console.log('');
    });
    
    // Find Google users (real accounts)
    const googleUsers = users.filter(u => u.googleId);
    
    if (googleUsers.length === 0) {
      console.log('❌ No Google users found.');
      console.log('   Please sign in with Google first to create your User record.');
      console.log('   Then run this script again.\n');
      return;
    }
    
    // Find test users (created during document uploads)
    const testUsers = users.filter(u => !u.googleId && u.email?.startsWith('test-'));
    
    if (testUsers.length === 0) {
      console.log('✅ No test users found - all users are Google users!\n');
      return;
    }
    
    console.log(`\n📄 Documents to Migrate:\n`);
    
    // For each test user, try to find matching Google user
    for (const testUser of testUsers) {
      const testUserDocs = await prisma.userDocument.findMany({
        where: { userId: testUser.id },
        select: {
          id: true,
          originalName: true,
          createdAt: true
        }
      });
      
      if (testUserDocs.length === 0) continue;
      
      console.log(`\nTest User: ${testUser.email} (${testUser.id})`);
      console.log(`  Documents: ${testUserDocs.length}`);
      testUserDocs.forEach(doc => {
        console.log(`    - ${doc.originalName} (${doc.createdAt.toISOString()})`);
      });
      
      // Try to match with Google user by creation time or email pattern
      // For now, we'll migrate to the most recent Google user
      const targetGoogleUser = googleUsers[0]; // Use first Google user
      
      if (targetGoogleUser) {
        console.log(`\n  → Will migrate to: ${targetGoogleUser.email} (${targetGoogleUser.id})`);
        
        // Ask for confirmation (in production, you'd want actual user input)
        console.log(`  ⚠️  To migrate, uncomment the migration code below.\n`);
        
        // Uncomment to actually migrate:
        /*
        try {
          await prisma.userDocument.updateMany({
            where: { userId: testUser.id },
            data: { userId: targetGoogleUser.id }
          });
          console.log(`  ✅ Migrated ${testUserDocs.length} documents successfully!`);
        } catch (error) {
          console.error(`  ❌ Migration failed:`, error.message);
        }
        */
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📋 INSTRUCTIONS');
    console.log('='.repeat(80));
    console.log('1. Sign in with Google to create your User record');
    console.log('2. Note your User ID from the output above');
    console.log('3. Uncomment the migration code in this script');
    console.log('4. Run: node migrate-documents-to-google-user.js');
    console.log('5. Your documents will be linked to your Google account\n');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateDocuments();

