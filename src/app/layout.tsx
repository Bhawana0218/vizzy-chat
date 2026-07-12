import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import ErrorBoundary from "@/components/ErrorBoundary";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vizzy Chat — Conversational Creative Operating System",
  description:
    "Create, transform, iterate, and deploy visual, narrative, and experiential content through natural conversation.",
  keywords: [
    "AI creative platform",
    "image generation",
    "design tool",
    "chat interface",
    "visual content creation",
    "marketing automation",
    "art generation",
  ],
  authors: [{ name: "Vizzy" }],
  openGraph: {
    title: "Vizzy Chat — Conversational Creative Operating System",
    description:
      "Create, transform, iterate, and deploy visual experiences using natural language.",
    type: "website",
    locale: "en_US",
    siteName: "Vizzy Chat",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vizzy Chat",
    description:
      "The conversational operating system for creativity.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-full flex flex-col bg-[#0a0a0c]">
        <ErrorBoundary>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
