import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
            <h1 className="text-9xl font-black text-gray-900 mb-4">404</h1>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h2>
            <p className="text-gray-500 mb-8 max-w-md">
                We couldn't find the page you're looking for. It might have been moved, deleted, or never existed.
            </p>
            <Link 
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 rounded-lg font-bold transition-all"
            >
                <ArrowLeft className="w-4 h-4" />
                Return Home
            </Link>
        </div>
    );
}
