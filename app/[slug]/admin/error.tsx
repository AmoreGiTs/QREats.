'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin Page Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            ⚠️
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-500 mb-6 text-sm">
            {error.message.includes('decryption') 
                ? 'Your session has expired or is invalid.' 
                : 'An unexpected error occurred accessing the dashboard.'}
        </p>
        <a 
            href="/api/auth/reset?callbackUrl=/" 
            className="block w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-all cursor-pointer"
        >
          Reset Session & Login
        </a>
      </div>
    </div>
  );
}
