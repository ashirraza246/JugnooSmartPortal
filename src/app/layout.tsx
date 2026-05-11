import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#1A3C5E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Jugnoo Smart Portal — AI-Powered Business Management",
  description: "Smart portal for Jugnoo Photostate, Chowk Azam. Manage orders, WhatsApp templates, customers, government services, notarisation, and payments — all in one place.",
  keywords: ["Jugnoo", "Photostate", "Chowk Azam", "Smart Portal", "Business Management", "WhatsApp Templates", "Notarisation"],
  authors: [{ name: "Jugnoo Smart Portal" }],
  icons: {
    icon: "/jugnoo-photos-logo.jpg",
    apple: "/jugnoo-photos-logo.jpg",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Jugnoo Smart Portal",
    description: "AI-Powered Business Management for Jugnoo Photostate",
    type: "website",
    images: ["/jugnoo-photos-logo.jpg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Jugnoo Smart Portal",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/jugnoo-photos-logo.jpg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${inter.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
