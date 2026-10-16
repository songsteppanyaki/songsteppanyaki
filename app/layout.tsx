
import type { Metadata } from "next";
import Script from "next/script";
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
      <body>
        {children}

        {/* Google Analytics 4 + Google Ads */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-9BH9RBLT3N"
          strategy="afterInteractive"
        />

        <Script id="google-tag-config" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            window.gtag = window.gtag || function() {
              window.dataLayer.push(arguments);
            };

            window.gtag('js', new Date());
            window.gtag('config', 'G-9BH9RBLT3N');
            window.gtag('config', 'AW-18454208775');
          `}
        </Script>
      </body>
    </html>
  );
}
