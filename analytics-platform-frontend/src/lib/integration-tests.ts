/**
 * Integration tests for frontend-backend communication
 * Run these tests to verify all API endpoints work correctly
 */

import { apiService } from './api';

export interface TestResult {
  test: string;
  success: boolean;
  error?: string;
  duration: number;
  data?: any;
}

export class IntegrationTester {
  private results: TestResult[] = [];

  async runAllTests(): Promise<TestResult[]> {
    console.log('🧪 Starting integration tests...');
    this.results = [];

    await this.testHealthCheck();
    await this.testAnalyticsOverview();
    await this.testKPIs();
    await this.testDocumentHealth();
    await this.testChatQuestion();
    await this.testChatHistory();
    await this.testDatasets();

    console.log('✅ Integration tests completed');
    return this.results;
  }

  private async runTest(
    testName: string,
    testFn: () => Promise<any>
  ): Promise<void> {
    const startTime = Date.now();
    try {
      const data = await testFn();
      const duration = Date.now() - startTime;
      
      this.results.push({
        test: testName,
        success: true,
        duration,
        data
      });
      
      console.log(`✅ ${testName} - ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.push({
        test: testName,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration
      });
      
      console.log(`❌ ${testName} - ${duration}ms - ${error}`);
    }
  }

  private async testHealthCheck(): Promise<void> {
    await this.runTest('Health Check', async () => {
      const response = await apiService.getHealth();
      if (!response.success) {
        throw new Error(`Health check failed: ${response.error}`);
      }
      return response.data;
    });
  }

  private async testAnalyticsOverview(): Promise<void> {
    await this.runTest('Analytics Overview', async () => {
      const response = await apiService.getAnalyticsOverview();
      if (!response.success) {
        throw new Error(`Analytics overview failed: ${response.error}`);
      }
      if (!response.data?.kpis) {
        throw new Error('Analytics overview missing KPIs data');
      }
      return response.data;
    });
  }

  private async testKPIs(): Promise<void> {
    await this.runTest('KPIs', async () => {
      const response = await apiService.getKPIs();
      if (!response.success) {
        throw new Error(`KPIs failed: ${response.error}`);
      }
      return response.data;
    });
  }

  private async testDocumentHealth(): Promise<void> {
    await this.runTest('Document Health', async () => {
      const response = await apiService.getDocumentHealth();
      if (!response.success) {
        throw new Error(`Document health failed: ${response.error}`);
      }
      if (!response.data?.services?.ai) {
        throw new Error('Document health missing AI service status');
      }
      return response.data;
    });
  }

  private async testChatQuestion(): Promise<void> {
    await this.runTest('Chat Question', async () => {
      const response = await apiService.askQuestion('What is the status of the system?');
      if (!response.success) {
        throw new Error(`Chat question failed: ${response.error}`);
      }
      if (!response.data?.answer) {
        throw new Error('Chat question missing answer');
      }
      return response.data;
    });
  }

  private async testChatHistory(): Promise<void> {
    await this.runTest('Chat History', async () => {
      const response = await apiService.getChatHistory();
      if (!response.success) {
        throw new Error(`Chat history failed: ${response.error}`);
      }
      if (!Array.isArray(response.data?.messages)) {
        throw new Error('Chat history missing messages array');
      }
      return response.data;
    });
  }

  private async testDatasets(): Promise<void> {
    await this.runTest('Datasets', async () => {
      const response = await apiService.getDatasets();
      if (!response.success) {
        throw new Error(`Datasets failed: ${response.error}`);
      }
      if (!Array.isArray(response.data?.datasets)) {
        throw new Error('Datasets missing datasets array');
      }
      return response.data;
    });
  }

  getResults(): TestResult[] {
    return this.results;
  }

  getSummary(): { total: number; passed: number; failed: number; averageDuration: number } {
    const total = this.results.length;
    const passed = this.results.filter(r => r.success).length;
    const failed = total - passed;
    const averageDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / total;

    return { total, passed, failed, averageDuration };
  }
}

// Export for use in development
export const integrationTester = new IntegrationTester();
