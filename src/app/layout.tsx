import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import Script from "next/script";
import { AuthProvider } from "@/components/providers/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dealcraft — Negotiation Career Simulator",
  description: "A premium negotiation career simulation game. Discover what reality actually is — and design a deal that reality will accept.",
  keywords: ["negotiation", "simulation", "career", "game", "strategy", "BATNA", "deal making"],
  authors: [{ name: "Dealcraft" }],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
            <Script src="https://assets.lemonsqueezy.com/lemon.js" strategy="afterInteractive" />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
