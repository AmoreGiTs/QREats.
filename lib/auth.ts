
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

// DEVELOPMENT SECRET - matches .env.development.local
const DEV_SECRET = "qreats-dev-secret-1234567890abcdef1234567890abcdef";

// Explicit interface to avoid type inference issues
interface DbUser {
    id: string;
    email: string;
    name: string | null;
    passwordHash: string | null;
    role: string;
    restaurantId: string | null;
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
        updateAge: 24 * 60 * 60, // Update session every 24h
    },

    // CRITICAL: Fixed secret for development
    secret: process.env.NEXTAUTH_SECRET || DEV_SECRET,

    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                }) as unknown as DbUser | null;

                if (!user || !user.passwordHash) {
                    return null;
                }

                const isValid = await bcrypt.compare(
                    credentials.password,
                    user.passwordHash
                );

                if (!isValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    restaurantId: user.restaurantId || "",
                };
            },
        })
    ],

    // 🔴 CRITICAL FOR MULTI-TENANT QR-EATS
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
                // Domain setting for multi-tenant
                domain: process.env.NODE_ENV === "development"
                    ? "localhost"
                    : ".qreats.app", // Root domain for subdomains
            }
        },
        callbackUrl: {
            name: `next-auth.callback-url`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
                domain: process.env.NODE_ENV === "development"
                    ? "localhost"
                    : ".qreats.app",
            }
        },
        csrfToken: {
            name: `next-auth.csrf-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NODE_ENV === "production",
                domain: process.env.NODE_ENV === "development"
                    ? "localhost"
                    : ".qreats.app",
            }
        }
    },

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.restaurantId = user.restaurantId;
                token.id = user.id;
            }
            return token;
        },

        async session({ session, token }) {
            if (token && session.user) {
                session.user.role = token.role as string;
                session.user.restaurantId = token.restaurantId as string;
                session.user.id = token.id as string;
            }
            return session;
        },

        // We remove the specific redirect callback that forces baseUrl to allow flexibility
        // Or we can implement it if we want strict domain control. 
        // The user suggested redirect callback handles multi-tenant redirects.

        async redirect({ url, baseUrl }) {
            // Handle multi-tenant redirects
            if (url.startsWith("/")) {
                return `${baseUrl}${url}`;
            } else if (new URL(url).origin === baseUrl) {
                return url;
            }
            return baseUrl;
        }
    },

    // Enable debug logs in development
    debug: process.env.NODE_ENV === "development",

    // Custom pages for QREats
    pages: {
        signIn: "/auth/login",
    }
};
