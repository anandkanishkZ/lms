'use client';

import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class NoticeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Notice Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Notice System Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-destructive/10 rounded-lg">
              <p className="text-sm font-medium text-destructive mb-2">
                Something went wrong while loading notices
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-xs text-gray-600 mt-2">
                  <summary className="cursor-pointer font-medium mb-1">
                    Error Details (Development Only)
                  </summary>
                  <pre className="whitespace-pre-wrap bg-gray-50 p-2 rounded mt-1 overflow-auto max-h-40">
                    {this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={this.handleReset} size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  this.setState({
                    hasError: false,
                    error: null,
                    errorInfo: null,
                  })
                }
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
