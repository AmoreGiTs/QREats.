import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { headers } from 'next/headers';
import MarketingLayout from '@/components/layouts/MarketingLayout';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import QueryProvider from '@/lib/providers/query-provider';
import { ThemeProvider } from "@/components/providers/ThemeProvider";

import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QREats - The Operating System for Modern Restaurants",
  description: "Manage inventory, orders, and multi-location operations with a single, intelligent platform.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || headersList.get('x-invoke-path') || '';

  // If we are at the root, use the marketing layout
  if (pathname === '/' || pathname === '') {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300`}>
          <SmoothScrollProvider>
            <QueryProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <ServiceWorkerRegister />
                <MarketingLayout>{children}</MarketingLayout>
              </ThemeProvider>
            </QueryProvider>
          </SmoothScrollProvider>
        </body>
      </html>
    );
  }

  // Otherwise, just render the core structure (which will use nested layouts for logic)
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300`}>
        <SmoothScrollProvider>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <ServiceWorkerRegister />
              {children}
            </ThemeProvider>
          </QueryProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
