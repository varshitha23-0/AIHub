import React from "react";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, info: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        this.setState({ error, info });
        // you could log to an external service here
        // console.error(error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
                    <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded">
                        {String(this.state.error)}
                        {this.state.info?.componentStack}
                    </pre>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
