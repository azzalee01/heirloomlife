import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-sans-loaded",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-instrument-serif-loaded",
});

const BASE_URL = 'https://www.heirloomlife.com.au'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Heirloom Life — Australian Wills and Estate Planning',
    template: '%s | Heirloom Life',
  },
  description: "An estate command centre for Australians — your Will and Living Vault, kept in one place.",
  twitter: {
    card: 'summary_large_image',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Heirloom Life',
  url: BASE_URL,
  description: 'Solicitor-reviewed Wills and a Living Vault to keep your estate plan current. Built for Australians.',
  areaServed: 'AU',
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Heirloom Life',
  url: BASE_URL,
  description: 'Australian Will and estate planning service.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${instrumentSerif.variable} antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
