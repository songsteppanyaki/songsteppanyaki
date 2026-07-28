import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SONG TEPPANYAKI",
  description: "Private hibachi chef experience brought to your home.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
