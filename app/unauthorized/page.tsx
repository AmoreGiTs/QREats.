'use client';

import Link from 'next/link';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 text-center">
            <div>
                <div className="text-6xl mb-4">🚫</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    You do not have permission to access this restaurant's workspace.
                    Please sign in with the correct account.
                </p>
                <Link
                    href="/auth/login"
                    className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors"
                >
                    Back to Login
                </Link>
            </div>
        </div>
    );
}
