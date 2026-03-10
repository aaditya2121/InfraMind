import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import PageTransition from "./components/PageTransition";
import GlobalBackground from "./components/GlobalBackground";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#020817",
};

export const metadata: Metadata = {
  title: "InfraMind | Campus, Hostel & PG Management Elevated",
  description: "Seamlessly report and track property infrastructure issues with AI-powered categorization.",
  icons: { icon: "/logo.png", apple: "/apple-touch-icon.png" },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "InfraMind",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen`}
        style={{ background: '#020817', fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}
      >
        {/* GlobalBackground sits here — OUTSIDE PageTransition — so it is
            always visible from the very first paint on every page,
            regardless of route transitions. */}
        <GlobalBackground />

        <Providers>
          <PageTransition>
            {children}
          </PageTransition>
        </Providers>
      </body>
    </html>
  );
}
