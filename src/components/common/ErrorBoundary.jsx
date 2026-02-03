import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in child component tree,
 * logs errors, and displays a fallback UI.
 */
export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        // Log to console in development
        if (import.meta.env.DEV) {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }
        // Could send to error reporting service here
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    handleGoHome = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.href = '/';
    };

    render() {
        const { hasError, error } = this.state;
        const { children, theme, fallback } = this.props;

        if (hasError) {
            // Custom fallback provided
            if (fallback) {
                return fallback({ error, retry: this.handleRetry });
            }

            // Default fallback UI
            const colors = {
                background: theme?.colors?.background || '#F0EDE8',
                surface: theme?.colors?.surface || '#FFFFFF',
                textPrimary: theme?.colors?.textPrimary || '#353535',
                textSecondary: theme?.colors?.textSecondary || '#666666',
                accent: theme?.colors?.accent || '#353535',
                border: theme?.colors?.border || '#E3E0D8',
                error: '#B85C5C'
            };

            return (
                <div 
                    className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
                    style={{ backgroundColor: colors.background }}
                >
                    <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                        style={{ backgroundColor: `${colors.error}15` }}
                    >
                        <AlertTriangle className="w-8 h-8" style={{ color: colors.error }} />
                    </div>

                    <h2 
                        className="text-xl font-bold mb-2"
                        style={{ color: colors.textPrimary }}
                    >
                        Something went wrong
                    </h2>

                    <p 
                        className="text-sm mb-6 max-w-sm"
                        style={{ color: colors.textSecondary }}
                    >
                        We encountered an unexpected error. Please try again or return to the home screen.
                    </p>

                    {import.meta.env.DEV && error && (
                        <pre 
                            className="text-xs p-3 rounded-xl mb-6 max-w-md overflow-auto text-left"
                            style={{ 
                                backgroundColor: colors.surface, 
                                color: colors.error,
                                border: `1px solid ${colors.border}`
                            }}
                        >
                            {error.toString()}
                        </pre>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={this.handleRetry}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                            style={{ 
                                backgroundColor: colors.accent, 
                                color: '#FFFFFF' 
                            }}
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try Again
                        </button>

                        <button
                            onClick={this.handleGoHome}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                            style={{ 
                                backgroundColor: colors.surface, 
                                color: colors.textPrimary,
                                border: `1px solid ${colors.border}`
                            }}
                        >
                            <Home className="w-4 h-4" />
                            Go Home
                        </button>
                    </div>
                </div>
            );
        }

        return children;
    }
}

export default ErrorBoundary;
