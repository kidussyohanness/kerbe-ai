#!/usr/bin/env node

/**
 * Performance and Load Testing for Financial Analysis System
 * Tests system performance under various load conditions
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { performance } = require('perf_hooks');

// Test configuration
const CONFIG = {
  backendUrl: 'http://localhost:8787',
  testDir: 'performance-test-files',
  concurrentRequests: 10,
  maxRequests: 100,
  timeout: 30000
};

// Performance metrics
let performanceMetrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  averageResponseTime: 0,
  minResponseTime: Infinity,
  maxResponseTime: 0,
  responseTimes: [],
  errors: []
};

// Create test directory
if (!fs.existsSync(CONFIG.testDir)) {
  fs.mkdirSync(CONFIG.testDir, { recursive: true });
}

// Generate test data
function generateTestData(size = 'normal') {
  const baseData = {
    small: {
      rows: 20,
      multiplier: 1
    },
    normal: {
      rows: 50,
      multiplier: 1
    },
    large: {
      rows: 200,
      multiplier: 1
    },
    xlarge: {
      rows: 1000,
      multiplier: 1
    }
  };
  
  const config = baseData[size] || baseData.normal;
  let csvContent = 'Account,Amount\n';
  
  // Generate repetitive data
  for (let i = 0; i < config.rows; i++) {
    csvContent += `Account ${i + 1},${(Math.random() * 1000000 * config.multiplier).toFixed(2)}\n`;
  }
  
  return csvContent;
}

// Create performance test files
function createPerformanceTestFiles() {
  const sizes = ['small', 'normal', 'large', 'xlarge'];
  
  sizes.forEach(size => {
    const content = generateTestData(size);
    const filename = `performance_${size}.csv`;
    const filePath = path.join(CONFIG.testDir, filename);
    fs.writeFileSync(filePath, content);
    console.log(`📝 Created ${filename} (${content.length} characters)`);
  });
}

// Single request test
async function makeRequest(filePath, documentType = 'balance_sheet') {
  const startTime = performance.now();
  
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('documentType', documentType);
    
    const response = await fetch(`${CONFIG.backendUrl}/document/analyze`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(CONFIG.timeout)
    });
    
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(`Analysis failed: ${result.error}`);
    }
    
    return {
      success: true,
      responseTime,
      result
    };
    
  } catch (error) {
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    
    return {
      success: false,
      responseTime,
      error: error.message
    };
  }
}

// Concurrent request test
async function testConcurrentRequests(filePath, concurrency = 5) {
  console.log(`\n🔄 Testing ${concurrency} concurrent requests...`);
  
  const promises = [];
  const startTime = performance.now();
  
  for (let i = 0; i < concurrency; i++) {
    promises.push(makeRequest(filePath));
  }
  
  const results = await Promise.all(promises);
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
  
  console.log(`   Total Time: ${totalTime.toFixed(2)}ms`);
  console.log(`   Successful: ${successful}/${concurrency}`);
  console.log(`   Failed: ${failed}/${concurrency}`);
  console.log(`   Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
  
  return {
    totalTime,
    successful,
    failed,
    avgResponseTime,
    results
  };
}

// Load test with increasing load
async function testIncreasingLoad(filePath) {
  console.log('\n📈 Testing increasing load...');
  
  const loadLevels = [1, 5, 10, 20, 50];
  const results = [];
  
  for (const load of loadLevels) {
    console.log(`\n   Load Level: ${load} concurrent requests`);
    
    const result = await testConcurrentRequests(filePath, load);
    results.push({
      load,
      ...result
    });
    
    // Brief pause between load levels
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
}

// Stress test
async function testStressLoad(filePath) {
  console.log('\n💥 Stress testing...');
  
  const stressLevels = [100, 200, 500];
  const results = [];
  
  for (const load of stressLevels) {
    console.log(`\n   Stress Level: ${load} requests`);
    
    const startTime = performance.now();
    const promises = [];
    
    for (let i = 0; i < load; i++) {
      promises.push(makeRequest(filePath));
    }
    
    const requestResults = await Promise.all(promises);
    const endTime = performance.now();
    const totalTime = endTime - startTime;
    
    const successful = requestResults.filter(r => r.success).length;
    const failed = requestResults.filter(r => !r.success).length;
    const avgResponseTime = requestResults.reduce((sum, r) => sum + r.responseTime, 0) / requestResults.length;
    
    console.log(`   Total Time: ${totalTime.toFixed(2)}ms`);
    console.log(`   Successful: ${successful}/${load}`);
    console.log(`   Failed: ${failed}/${load}`);
    console.log(`   Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    console.log(`   Requests/Second: ${(load / (totalTime / 1000)).toFixed(2)}`);
    
    results.push({
      load,
      totalTime,
      successful,
      failed,
      avgResponseTime,
      requestsPerSecond: load / (totalTime / 1000)
    });
    
    // Longer pause between stress levels
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  return results;
}

// Memory usage test
async function testMemoryUsage(filePath) {
  console.log('\n🧠 Testing memory usage...');
  
  const initialMemory = process.memoryUsage();
  console.log(`   Initial Memory: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  
  // Process multiple requests to test memory growth
  const requests = 50;
  const results = [];
  
  for (let i = 0; i < requests; i++) {
    const result = await makeRequest(filePath);
    results.push(result);
    
    if (i % 10 === 0) {
      const currentMemory = process.memoryUsage();
      console.log(`   After ${i + 1} requests: ${(currentMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    }
  }
  
  const finalMemory = process.memoryUsage();
  const memoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
  
  console.log(`   Final Memory: ${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Memory Growth: ${(memoryGrowth / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Average Growth per Request: ${(memoryGrowth / requests / 1024).toFixed(2)} KB`);
  
  return {
    initialMemory: initialMemory.heapUsed,
    finalMemory: finalMemory.heapUsed,
    memoryGrowth,
    requests
  };
}

// Response time distribution test
async function testResponseTimeDistribution(filePath, requests = 100) {
  console.log(`\n⏱️ Testing response time distribution (${requests} requests)...`);
  
  const responseTimes = [];
  const errors = [];
  
  for (let i = 0; i < requests; i++) {
    const result = await makeRequest(filePath);
    
    if (result.success) {
      responseTimes.push(result.responseTime);
    } else {
      errors.push(result.error);
    }
    
    if (i % 20 === 0) {
      console.log(`   Processed ${i + 1}/${requests} requests...`);
    }
  }
  
  if (responseTimes.length > 0) {
    responseTimes.sort((a, b) => a - b);
    
    const min = responseTimes[0];
    const max = responseTimes[responseTimes.length - 1];
    const avg = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    const median = responseTimes[Math.floor(responseTimes.length / 2)];
    const p95 = responseTimes[Math.floor(responseTimes.length * 0.95)];
    const p99 = responseTimes[Math.floor(responseTimes.length * 0.99)];
    
    console.log(`   Min Response Time: ${min.toFixed(2)}ms`);
    console.log(`   Max Response Time: ${max.toFixed(2)}ms`);
    console.log(`   Average Response Time: ${avg.toFixed(2)}ms`);
    console.log(`   Median Response Time: ${median.toFixed(2)}ms`);
    console.log(`   95th Percentile: ${p95.toFixed(2)}ms`);
    console.log(`   99th Percentile: ${p99.toFixed(2)}ms`);
    console.log(`   Success Rate: ${((responseTimes.length / requests) * 100).toFixed(1)}%`);
    
    return {
      min,
      max,
      avg,
      median,
      p95,
      p99,
      successRate: (responseTimes.length / requests) * 100,
      errors
    };
  } else {
    console.log('   No successful requests');
    return { errors };
  }
}

// Performance test runner
class PerformanceTestRunner {
  constructor() {
    this.results = {
      fileSizes: {},
      concurrentLoad: {},
      stressTest: {},
      memoryUsage: {},
      responseTimeDistribution: {}
    };
  }

  async runAllTests() {
    console.log('🚀 Starting Performance and Load Testing');
    console.log('========================================');
    
    // Create test files
    createPerformanceTestFiles();
    
    // Test different file sizes
    await this.testFileSizes();
    
    // Test concurrent load
    await this.testConcurrentLoad();
    
    // Test stress load
    await this.testStressLoad();
    
    // Test memory usage
    await this.testMemoryUsage();
    
    // Test response time distribution
    await this.testResponseTimeDistribution();
    
    this.printSummary();
  }

  async testFileSizes() {
    console.log('\n📊 Testing different file sizes...');
    
    const sizes = ['small', 'normal', 'large', 'xlarge'];
    
    for (const size of sizes) {
      const filePath = path.join(CONFIG.testDir, `performance_${size}.csv`);
      console.log(`\n   Testing ${size} file...`);
      
      const result = await makeRequest(filePath);
      
      if (result.success) {
        console.log(`   ✅ Success: ${result.responseTime.toFixed(2)}ms`);
        this.results.fileSizes[size] = {
          success: true,
          responseTime: result.responseTime
        };
      } else {
        console.log(`   ❌ Failed: ${result.error}`);
        this.results.fileSizes[size] = {
          success: false,
          error: result.error
        };
      }
    }
  }

  async testConcurrentLoad() {
    const filePath = path.join(CONFIG.testDir, 'performance_normal.csv');
    const result = await testIncreasingLoad(filePath);
    this.results.concurrentLoad = result;
  }

  async testStressLoad() {
    const filePath = path.join(CONFIG.testDir, 'performance_normal.csv');
    const result = await testStressLoad(filePath);
    this.results.stressTest = result;
  }

  async testMemoryUsage() {
    const filePath = path.join(CONFIG.testDir, 'performance_normal.csv');
    const result = await testMemoryUsage(filePath);
    this.results.memoryUsage = result;
  }

  async testResponseTimeDistribution() {
    const filePath = path.join(CONFIG.testDir, 'performance_normal.csv');
    const result = await testResponseTimeDistribution(filePath, 100);
    this.results.responseTimeDistribution = result;
  }

  printSummary() {
    console.log('\n📈 PERFORMANCE TEST SUMMARY');
    console.log('===========================');
    
    // File size performance
    console.log('\n📊 File Size Performance:');
    Object.entries(this.results.fileSizes).forEach(([size, result]) => {
      if (result.success) {
        console.log(`   ${size}: ${result.responseTime.toFixed(2)}ms`);
      } else {
        console.log(`   ${size}: FAILED - ${result.error}`);
      }
    });
    
    // Concurrent load performance
    if (this.results.concurrentLoad.length > 0) {
      console.log('\n🔄 Concurrent Load Performance:');
      this.results.concurrentLoad.forEach(result => {
        console.log(`   ${result.load} concurrent: ${result.avgResponseTime.toFixed(2)}ms avg, ${result.successful}/${result.load} successful`);
      });
    }
    
    // Stress test performance
    if (this.results.stressTest.length > 0) {
      console.log('\n💥 Stress Test Performance:');
      this.results.stressTest.forEach(result => {
        console.log(`   ${result.load} requests: ${result.requestsPerSecond.toFixed(2)} req/s, ${result.successful}/${result.load} successful`);
      });
    }
    
    // Memory usage
    if (this.results.memoryUsage) {
      console.log('\n🧠 Memory Usage:');
      console.log(`   Initial: ${(this.results.memoryUsage.initialMemory / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Final: ${(this.results.memoryUsage.finalMemory / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Growth: ${(this.results.memoryUsage.memoryGrowth / 1024 / 1024).toFixed(2)} MB`);
    }
    
    // Response time distribution
    if (this.results.responseTimeDistribution.avg) {
      console.log('\n⏱️ Response Time Distribution:');
      console.log(`   Average: ${this.results.responseTimeDistribution.avg.toFixed(2)}ms`);
      console.log(`   Median: ${this.results.responseTimeDistribution.median.toFixed(2)}ms`);
      console.log(`   95th Percentile: ${this.results.responseTimeDistribution.p95.toFixed(2)}ms`);
      console.log(`   99th Percentile: ${this.results.responseTimeDistribution.p99.toFixed(2)}ms`);
      console.log(`   Success Rate: ${this.results.responseTimeDistribution.successRate.toFixed(1)}%`);
    }
    
    // Performance recommendations
    console.log('\n💡 Performance Recommendations:');
    
    if (this.results.responseTimeDistribution.avg > 5000) {
      console.log('   ⚠️ Average response time is high (>5s). Consider optimization.');
    }
    
    if (this.results.responseTimeDistribution.p95 > 10000) {
      console.log('   ⚠️ 95th percentile response time is very high (>10s).');
    }
    
    if (this.results.memoryUsage && this.results.memoryUsage.memoryGrowth > 100 * 1024 * 1024) {
      console.log('   ⚠️ Memory growth is significant (>100MB). Check for memory leaks.');
    }
    
    if (this.results.stressTest.length > 0) {
      const maxRPS = Math.max(...this.results.stressTest.map(r => r.requestsPerSecond));
      if (maxRPS < 10) {
        console.log('   ⚠️ Maximum requests per second is low (<10). Consider scaling.');
      }
    }
    
    console.log('\n✅ Performance testing completed!');
  }
}

// Cleanup function
function cleanup() {
  if (fs.existsSync(CONFIG.testDir)) {
    fs.rmSync(CONFIG.testDir, { recursive: true, force: true });
  }
}

// Main execution
async function main() {
  try {
    // Check if backend is running
    console.log('🔍 Checking backend status...');
    const healthResponse = await fetch(`${CONFIG.backendUrl}/health`);
    if (!healthResponse.ok) {
      throw new Error('Backend is not running. Please start it first.');
    }
    console.log('✅ Backend is running');
    
    // Run performance tests
    const testRunner = new PerformanceTestRunner();
    await testRunner.runAllTests();
    
  } catch (error) {
    console.error(`💥 Performance test suite failed: ${error.message}`);
    process.exit(1);
  } finally {
    cleanup();
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Performance test suite interrupted');
  cleanup();
  process.exit(0);
});

// Run the performance test suite
if (require.main === module) {
  main();
}

module.exports = { PerformanceTestRunner, CONFIG };
