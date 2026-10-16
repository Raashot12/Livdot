import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/shared/providers/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});
export const metadata: Metadata = {
  title: "LIV DOT | Live event operations",
  description: "Host, schedule, and broadcast live events with LIV DOT.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
