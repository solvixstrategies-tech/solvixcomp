import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SolvixComp \u2014 AI-Powered Competitor Analysis",
  description: "Get McKinsey-grade competitor analysis reports in minutes. SWOT grids, scoring matrices, opportunity maps, and strategic recommendations \u2014 all powered by AI.",
  keywords: "competitor analysis, market research, SWOT analysis, competitive intelligence, business strategy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
