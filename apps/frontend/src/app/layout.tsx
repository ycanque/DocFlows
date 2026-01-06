import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SessionTimeoutWarning } from "@/components/SessionTimeoutWarning";
import { BfcacheHandler } from "@/components/BfcacheHandler";
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
  title: "DocFlows - Document Workflow Management",
  description: "Document workflow management system for requisitions, payments, and approvals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <BfcacheHandler />
        <ThemeProvider>
          <AuthProvider>
            <SessionTimeoutWarning />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
