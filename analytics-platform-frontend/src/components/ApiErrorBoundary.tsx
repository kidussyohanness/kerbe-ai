'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ApiErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('API Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="glass-card glass-orange p-6 text-center">
          <div className="text-4xl mb-4 font-bold text-red-500">ERROR</div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Connection Issue
          </h3>
          <p className="text-text-secondary mb-4">
            Unable to connect to the backend service. Please check your connection and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="glass-button glass-blue px-4 py-2 text-text-primary rounded-lg hover-lift"
          >
            🔄 Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ApiErrorBoundary;
