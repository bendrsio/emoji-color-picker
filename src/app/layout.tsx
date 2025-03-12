import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Emoji Color Picker",
  description: "Find an emoji that matches a color",
  openGraph: {
    title: "Emoji Color Picker",
    description: "Find an emoji that matches a color",
    url: "https://emoji.desprets.net",
    siteName: "Emoji Color Picker",
    images: [
      {
        url: "https://emoji.desprets.net/preview.jpg",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Emoji Color Picker",
    description: "Find an emoji that matches a color",
    images: ["https://emoji.desprets.net/preview.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
