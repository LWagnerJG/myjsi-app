import React from 'react';

export class MembersErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, info) {
        console.error('Members screen error:', error, info);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-full p-4">
                    <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
                    <p className="text-sm text-gray-600 mb-4">There was an error loading this screen.</p>
                    <button onClick={() => this.setState({ hasError: false, error: null })}
                        className="px-4 py-2 rounded-full text-sm font-semibold"
                        style={{ backgroundColor: 'var(--theme-accent, #353535)', color: 'var(--theme-accent-text, #fff)' }}>
                        Try Again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
