import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
          <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
          <p className="text-xl mb-6 text-muted-foreground">
            We're sorry, but an unexpected error occurred.
          </p>
          <div className="bg-secondary/50 p-4 rounded-md mb-6 max-w-lg overflow-auto">
            <code className="text-sm text-red-400">
              {this.state.error && this.state.error.toString()}
            </code>
          </div>
          <Button onClick={() => window.location.reload()} variant="default">
            Reload Application
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
