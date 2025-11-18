#!/usr/bin/env node

/**
 * Check User Documents - Diagnostic tool
 * Shows which documents belong to which users
 */

const path = require('path');
const { PrismaClient } = require(path.join(__dirname, 'analytics-platform-backend/node_modules/@prisma/client'));

// Set database URL
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:' + path.join(__dirname, 'analytics-platform-backend/prisma/dev.db');

const prisma = new PrismaClient();

async function checkDocuments() {
  console.log('🔍 Document Storage Diagnostic\n');
  console.log('='.repeat(80));
  
  try {
    // Get all users
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`\n👥 Users in Database (${users.length}):\n`);
    users.forEach((user, idx) => {
      console.log(`${idx + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log(`   Name: ${user.name || 'N/A'}`);
      console.log(`   Google ID: ${user.googleId || 'N/A'}`);
      console.log(`   Created: ${user.createdAt.toISOString()}`);
      console.log('');
    });
    
    // Get all documents
    const documents = await prisma.userDocument.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        originalName: true,
        documentType: true,
        status: true,
        createdAt: true
      }
    });
    
    console.log(`\n📄 Documents in Database (${documents.length}):\n`);
    
    // Group by userId
    const docsByUser = {};
    documents.forEach(doc => {
      if (!docsByUser[doc.userId]) {
        docsByUser[doc.userId] = [];
      }
      docsByUser[doc.userId].push(doc);
    });
    
    Object.entries(docsByUser).forEach(([userId, docs]) => {
      const user = users.find(u => u.id === userId);
      console.log(`\nUser ID: ${userId}`);
      if (user) {
        console.log(`  ✅ User exists: ${user.email || user.name || 'N/A'}`);
      } else {
        console.log(`  ❌ User NOT FOUND in database!`);
      }
      console.log(`  Documents (${docs.length}):`);
      docs.forEach((doc, idx) => {
        console.log(`    ${idx + 1}. ${doc.originalName}`);
        console.log(`       Type: ${doc.documentType}, Status: ${doc.status}`);
        console.log(`       Created: ${doc.createdAt.toISOString()}`);
      });
    });
    
    // Get chat messages
    const chatMessages = await prisma.chatMessage.groupBy({
      by: ['userId'],
      _count: { id: true }
    });
    
    console.log(`\n💬 Chat Messages by User:\n`);
    chatMessages.forEach(group => {
      const user = users.find(u => u.id === group.userId);
      console.log(`User ID: ${group.userId}`);
      if (user) {
        console.log(`  ✅ User exists: ${user.email || user.name || 'N/A'}`);
      } else {
        console.log(`  ❌ User NOT FOUND`);
      }
      console.log(`  Messages: ${group._count.id}`);
    });
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Users: ${users.length}`);
    console.log(`Total Documents: ${documents.length}`);
    console.log(`Total Chat Messages: ${chatMessages.reduce((sum, g) => sum + g._count.id, 0)}`);
    
    const orphanedDocs = documents.filter(doc => !users.find(u => u.id === doc.userId));
    if (orphanedDocs.length > 0) {
      console.log(`\n⚠️  Orphaned Documents: ${orphanedDocs.length}`);
      console.log('   These documents have userIds that don\'t match any User record.');
      console.log('   Solution: Sign in again to create your User record, then we can migrate these.');
    } else {
      console.log(`\n✅ All documents have valid userIds!`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDocuments();

