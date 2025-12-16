import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
    const cookieStore = await cookies();

    // Clear all auth related cookies
    cookieStore.delete('next-auth.session-token');
    cookieStore.delete('next-auth.callback-url');
    cookieStore.delete('next-auth.csrf-token');

    const url = new URL(request.url);
    const callback = url.searchParams.get('callbackUrl') || '/';

    redirect(callback);
}
