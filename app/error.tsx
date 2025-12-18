'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Global Error:', error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-center px-4">
            <h2 className="text-2xl font-bold bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
                Something went wrong!
            </h2>
            <p className="text-gray-600 mb-8 max-w-md">
                We apologize for the inconvenience. Our team has been notified.
                {error.digest && <span className="block mt-2 text-xs text-gray-400">Error ID: {error.digest}</span>}
            </p>
            <div className="flex gap-4">
                <Button onClick={() => window.location.reload()} variant="outline">
                    Reload Page
                </Button>
                <Button
                    onClick={() => reset()}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                    Try Again
                </Button>
            </div>
        </div>
    );
}
