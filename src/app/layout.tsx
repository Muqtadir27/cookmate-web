import type { Metadata } from "next"
import "./globals.css"
import ErrorBoundary from "@/components/ErrorBoundary"
import AuthProvider from "@/components/AuthProvider"

export const viewport = {
  width: "device-width",
  initialScale: 1,
}

export const metadata: Metadata = {
  title: "CookMate AI - Scan ingredients, cook anything",
  description: "AI-powered cooking assistant. Scan your fridge, get instant personalized recipes from any cuisine in the world.",
  keywords: ["cooking", "AI recipes", "meal planner", "ingredient scanner", "food AI"],
  authors: [{ name: "CookMate AI" }],
  creator: "CookMate AI",
  metadataBase: new URL("https://cookmate-ai.vercel.app"),
  openGraph: {
    title: "CookMate AI - Scan ingredients, cook anything",
    description: "Point your camera at your fridge. AI identifies ingredients and generates personalized recipes instantly.",
    url: "https://cookmate-ai.vercel.app",
    siteName: "CookMate AI",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "CookMate AI" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CookMate AI - Scan ingredients, cook anything",
    description: "AI-powered cooking assistant. Scan your fridge, get instant recipes.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FF6B35" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body style={{ background: "#080810", minHeight: "100vh", margin: 0 }}>
        <AuthProvider><ErrorBoundary>{children}</ErrorBoundary></AuthProvider>
      </body>
    </html>
  )
}
