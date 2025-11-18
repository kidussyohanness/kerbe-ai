#!/usr/bin/env node

/**
 * Test script for PDF processing functionality
 * This script tests the real PDF processing implementation
 */

const fs = require('fs');
const path = require('path');

// Test PDF files available in the project
const testPdfs = [
  'balance-sheet-apple.pdf',
  'cash-flow-apple.pdf', 
  'income-statement-apple.pdf'
];

async function testPdfProcessing() {
  console.log('🧪 Testing PDF Processing Implementation\n');
  
  // Check if test PDFs exist
  console.log('📁 Checking for test PDF files...');
  const availablePdfs = testPdfs.filter(pdf => {
    const filePath = path.join(__dirname, pdf);
    const exists = fs.existsSync(filePath);
    console.log(`  ${exists ? '✅' : '❌'} ${pdf}`);
    return exists;
  });
  
  if (availablePdfs.length === 0) {
    console.log('\n❌ No test PDF files found. Please ensure the following files exist:');
    testPdfs.forEach(pdf => console.log(`  - ${pdf}`));
    return;
  }
  
  console.log(`\n📊 Found ${availablePdfs.length} test PDF files\n`);
  
  // Test PDF processing for each file
  for (const pdfFile of availablePdfs) {
    console.log(`🔍 Testing: ${pdfFile}`);
    console.log('─'.repeat(50));
    
    try {
      // Read PDF file
      const filePath = path.join(__dirname, pdfFile);
      const fileBuffer = fs.readFileSync(filePath);
      const base64Content = fileBuffer.toString('base64');
      
      console.log(`📄 File size: ${(fileBuffer.length / 1024).toFixed(2)} KB`);
      
      // Test PDF parsing
      const pdfParse = require('pdf-parse');
      const pdfData = await pdfParse(fileBuffer);
      
      console.log(`📝 Extracted text length: ${pdfData.text.length} characters`);
      console.log(`📊 Number of pages: ${pdfData.numpages}`);
      
      // Show first 200 characters of extracted text
      const preview = pdfData.text.substring(0, 200).replace(/\n/g, ' ').trim();
      console.log(`👀 Text preview: "${preview}..."`);
      
      // Check for financial keywords
      const financialKeywords = ['assets', 'liabilities', 'equity', 'revenue', 'expenses', 'cash', 'balance'];
      const foundKeywords = financialKeywords.filter(keyword => 
        pdfData.text.toLowerCase().includes(keyword)
      );
      
      console.log(`💰 Financial keywords found: ${foundKeywords.join(', ')}`);
      
      // Test with DocumentAnalysisService
      console.log('\n🤖 Testing with DocumentAnalysisService...');
      
      // Import the service (this will test the integration)
      const { DocumentAnalysisService } = require('./analytics-platform-backend/dist/services/documentAnalysis.js');
      
      if (DocumentAnalysisService) {
        const service = DocumentAnalysisService.getInstance();
        
        // Determine document type based on filename
        let documentType = 'balance_sheet';
        if (pdfFile.includes('income')) documentType = 'income_statement';
        if (pdfFile.includes('cash')) documentType = 'cash_flow';
        
        console.log(`📋 Document type: ${documentType}`);
        
        // Test text extraction
        const extractedText = await service.extractTextFromDocument(base64Content, 'application/pdf');
        console.log(`✅ Text extraction successful: ${extractedText.length} characters`);
        
        // Show first 100 characters of extracted text
        const servicePreview = extractedText.substring(0, 100).replace(/\n/g, ' ').trim();
        console.log(`🔍 Service preview: "${servicePreview}..."`);
        
      } else {
        console.log('⚠️  DocumentAnalysisService not available (may need to build first)');
      }
      
    } catch (error) {
      console.log(`❌ Error processing ${pdfFile}:`);
      console.log(`   ${error.message}`);
    }
    
    console.log('\n');
  }
  
  console.log('🎉 PDF Processing Test Complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. Build the backend: cd analytics-platform-backend && npm run build');
  console.log('2. Test with real API: npm run dev');
  console.log('3. Upload a PDF through the frontend interface');
  console.log('4. Check the AI analysis results');
}

// Run the test
testPdfProcessing().catch(console.error);