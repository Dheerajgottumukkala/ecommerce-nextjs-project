import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { Providers } from '@/components/providers/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EliteStore - Premium E-commerce Experience',
  description: 'Discover premium products with exceptional quality and service. Your trusted destination for electronics, fashion, home goods, and more.',
  keywords: 'ecommerce, shopping, electronics, fashion, home goods, premium products',
  authors: [{ name: 'EliteStore Team' }],
  openGraph: {
    title: 'EliteStore - Premium E-commerce Experience',
    description: 'Discover premium products with exceptional quality and service.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
            <Toaster position="top-right" />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}