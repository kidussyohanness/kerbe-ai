const FormData = require('form-data');
const fs = require('fs');

async function testFinancialAnalysis() {
  try {
    console.log('🧪 Testing Financial Analysis Tool...');
    
    // Create test data
    const testData = `Company Name,ABC Corporation Inc.
Period,Q4 2024
Total Assets,$2,500,000
Current Assets,$800,000
Fixed Assets,$1,700,000
Total Liabilities,$1,200,000
Current Liabilities,$400,000
Long-term Debt,$800,000
Shareholders Equity,$1,300,000`;

    // Write test file
    fs.writeFileSync('test-data.csv', testData);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream('test-data.csv'));
    formData.append('documentType', 'balance_sheet');
    formData.append('businessContext', 'Test company for validation');
    formData.append('questions', JSON.stringify([
      "What is the total value of the company's assets?",
      "What is the total amount of debt/liabilities?",
      "What is the company's net worth (equity)?"
    ]));

    console.log('📤 Sending request to backend...');
    
    // Test backend directly
    const response = await fetch('http://localhost:8787/document/question-analysis', {
      method: 'POST',
      body: formData,
    });

    console.log('📊 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend error:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Backend response:', JSON.stringify(result, null, 2));
    
    // Test frontend API
    console.log('\n🧪 Testing frontend API...');
    
    const frontendFormData = new FormData();
    frontendFormData.append('file', fs.createReadStream('test-data.csv'));
    frontendFormData.append('documentType', 'balance_sheet');
    frontendFormData.append('businessContext', 'Test company for validation');
    frontendFormData.append('questions', JSON.stringify([
      "What is the total value of the company's assets?",
      "What is the total amount of debt/liabilities?",
      "What is the company's net worth (equity)?"
    ]));

    const frontendResponse = await fetch('http://localhost:3000/api/document/question-analysis', {
      method: 'POST',
      body: frontendFormData,
    });

    console.log('📊 Frontend response status:', frontendResponse.status);
    
    if (!frontendResponse.ok) {
      const errorText = await frontendResponse.text();
      console.error('❌ Frontend API error:', errorText);
      return;
    }

    const frontendResult = await frontendResponse.json();
    console.log('✅ Frontend API response:', JSON.stringify(frontendResult, null, 2));
    
    // Validate structure
    if (frontendResult.success && frontendResult.data && Array.isArray(frontendResult.data.answers)) {
      console.log('🎉 SUCCESS: Response format is correct!');
      console.log('📋 Answers received:', frontendResult.data.answers.length);
      console.log('🎯 Confidence:', frontendResult.data.confidence);
    } else {
      console.error('❌ FAILURE: Invalid response format');
      console.error('Expected: { success: true, data: { answers: [...] } }');
      console.error('Received:', frontendResult);
    }
    
    // Cleanup
    fs.unlinkSync('test-data.csv');
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testFinancialAnalysis();
