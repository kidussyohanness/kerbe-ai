#!/usr/bin/env node

/**
 * Migrate Documents to User
 * Migrates documents from old userId format to new database User ID
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateDocuments() {
  console.log('🔄 Migrating Documents to Correct User IDs\n');
  console.log('='.repeat(80));
  
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        googleId: true
      }
    });
    
    if (users.length === 0) {
      console.log('❌ No users found in database.');
      console.log('   Please sign in first to create your User record.');
      return;
    }
    
    console.log(`\n📊 Found ${users.length} users:\n`);
    users.forEach((user, idx) => {
      console.log(`${idx + 1}. ${user.email || user.name || 'N/A'} (ID: ${user.id})`);
    });
    
    // Get all documents
    const allDocuments = await prisma.userDocument.findMany({
      select: {
        id: true,
        userId: true,
        originalName: true,
        createdAt: true
      }
    });
    
    console.log(`\n📄 Found ${allDocuments.length} total documents\n`);
    
    // Find documents that need migration
    const documentsToMigrate = [];
    
    for (const doc of allDocuments) {
      const userExists = users.find(u => u.id === doc.userId);
      if (!userExists) {
        // Try to match by email pattern
        if (doc.userId.startsWith('user_')) {
          const emailPattern = doc.userId.replace('user_', '').replace(/_/g, '.');
          const matchingUser = users.find(u => {
            if (!u.email) return false;
            // Try different matching strategies
            const normalizedEmail = u.email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
            return normalizedEmail.includes(emailPattern) || emailPattern.includes(normalizedEmail);
          });
          
          if (matchingUser) {
            documentsToMigrate.push({
              document: doc,
              oldUserId: doc.userId,
              newUserId: matchingUser.id,
              matchReason: `Matched by email pattern`
            });
          }
        }
      }
    }
    
    if (documentsToMigrate.length === 0) {
      console.log('✅ No documents need migration - all have valid userIds!\n');
      return;
    }
    
    console.log(`\n🔄 Found ${documentsToMigrate.length} documents to migrate:\n`);
    documentsToMigrate.forEach((migration, idx) => {
      console.log(`${idx + 1}. ${migration.document.originalName}`);
      console.log(`   Old userId: ${migration.oldUserId}`);
      console.log(`   New userId: ${migration.newUserId}`);
      console.log(`   Reason: ${migration.matchReason}`);
      console.log('');
    });
    
    // Ask for confirmation (in a real scenario, you'd want user input)
    console.log('⚠️  To migrate documents, uncomment the migration code below.');
    console.log('   This will update all documents to use the correct userId.\n');
    
    // Uncomment to actually migrate:
    /*
    let migrated = 0;
    for (const migration of documentsToMigrate) {
      try {
        await prisma.userDocument.update({
          where: { id: migration.document.id },
          data: { userId: migration.newUserId }
        });
        migrated++;
        console.log(`✅ Migrated: ${migration.document.originalName}`);
      } catch (error) {
        console.error(`❌ Failed to migrate ${migration.document.originalName}:`, error.message);
      }
    }
    console.log(`\n✅ Migrated ${migrated} documents successfully!`);
    */
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateDocuments();

