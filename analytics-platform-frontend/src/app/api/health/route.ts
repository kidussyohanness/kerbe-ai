import { NextRequest, NextResponse } from 'next/server';

// Error monitoring middleware
export function errorMonitoringMiddleware(request: NextRequest) {
  const startTime = Date.now();
  
  return {
    onError: (error: Error, context: string) => {
      const duration = Date.now() - startTime;
      const errorInfo = {
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack,
        context,
        url: request.url,
        method: request.method,
        userAgent: request.headers.get('user-agent'),
        duration,
        severity: getErrorSeverity(error),
        category: categorizeError(error)
      };

      // Log error details
      console.error('🚨 Error Monitoring:', errorInfo);

      // In production, you would send this to an error monitoring service
      // like Sentry, LogRocket, or DataDog
      if (process.env.NODE_ENV === 'production') {
        // sendToErrorService(errorInfo);
      }

      return errorInfo;
    },

    onSuccess: (response: NextResponse, context: string) => {
      const duration = Date.now() - startTime;
      console.log(`✅ ${context} completed in ${duration}ms`);
    }
  };
}

function getErrorSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
  const message = error.message.toLowerCase();
  
  if (message.includes('database') || message.includes('prisma')) {
    return 'critical';
  }
  if (message.includes('auth') || message.includes('session')) {
    return 'high';
  }
  if (message.includes('api') || message.includes('fetch')) {
    return 'medium';
  }
  
  return 'low';
}

function categorizeError(error: Error): string {
  const message = error.message.toLowerCase();
  
  if (message.includes('database') || message.includes('prisma')) {
    return 'database';
  }
  if (message.includes('auth') || message.includes('session')) {
    return 'authentication';
  }
  if (message.includes('api') || message.includes('fetch')) {
    return 'api';
  }
  if (message.includes('validation') || message.includes('schema')) {
    return 'validation';
  }
  
  return 'unknown';
}

// Health check endpoint with error monitoring
export async function GET(request: NextRequest) {
  const monitor = errorMonitoringMiddleware(request);
  
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const healthChecks = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      services: {
        database: 'unknown',
        nextauth: 'unknown',
        environment: 'unknown'
      },
      errors: [] as string[]
    };

    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      healthChecks.services.database = 'healthy';
    } catch (error) {
      healthChecks.services.database = 'unhealthy';
      const errorMessage = `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      healthChecks.errors.push(errorMessage);
      monitor.onError(error instanceof Error ? error : new Error(errorMessage), 'database-health-check');
    }

    // Check NextAuth configuration
    try {
      const requiredEnvVars = [
        'NEXTAUTH_SECRET',
        'NEXTAUTH_URL',
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'DATABASE_URL'
      ];

      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length === 0) {
        healthChecks.services.nextauth = 'healthy';
      } else {
        healthChecks.services.nextauth = 'unhealthy';
        const errorMessage = `Missing environment variables: ${missingVars.join(', ')}`;
        healthChecks.errors.push(errorMessage);
        monitor.onError(new Error(errorMessage), 'nextauth-config-check');
      }
    } catch (error) {
      healthChecks.services.nextauth = 'unhealthy';
      const errorMessage = `NextAuth error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      healthChecks.errors.push(errorMessage);
      monitor.onError(error instanceof Error ? error : new Error(errorMessage), 'nextauth-health-check');
    }

    // Check environment configuration
    try {
      const envChecks = {
        NODE_ENV: process.env.NODE_ENV,
        DATABASE_URL: process.env.DATABASE_URL ? 'configured' : 'missing',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        PORT: process.env.PORT || '3000'
      };

      if (envChecks.DATABASE_URL === 'configured' && envChecks.NEXTAUTH_URL) {
        healthChecks.services.environment = 'healthy';
      } else {
        healthChecks.services.environment = 'unhealthy';
        const errorMessage = 'Environment configuration incomplete';
        healthChecks.errors.push(errorMessage);
        monitor.onError(new Error(errorMessage), 'environment-config-check');
      }
    } catch (error) {
      healthChecks.services.environment = 'unhealthy';
      const errorMessage = `Environment error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      healthChecks.errors.push(errorMessage);
      monitor.onError(error instanceof Error ? error : new Error(errorMessage), 'environment-health-check');
    }

    // Determine overall status
    const allHealthy = Object.values(healthChecks.services).every(status => status === 'healthy');
    healthChecks.status = allHealthy ? 'healthy' : 'unhealthy';

    const statusCode = allHealthy ? 200 : 503;
    const response = NextResponse.json(healthChecks, { status: statusCode });
    
    monitor.onSuccess(response, 'health-check');
    return response;

  } catch (error) {
    const errorInfo = monitor.onError(error instanceof Error ? error : new Error('Unknown error'), 'health-check-endpoint');
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      services: {
        database: 'unknown',
        nextauth: 'unknown',
        environment: 'unknown'
      },
      errorInfo
    }, { status: 500 });
  } finally {
    // Clean up Prisma connection
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      await prisma.$disconnect();
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}