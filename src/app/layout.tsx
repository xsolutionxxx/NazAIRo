import type { Metadata } from "next";
import localFont from "next/font/local";

import { Providers } from "./providers";

import "./globals.css";

const montserrat = localFont({
  src: [
    {
      path: "../shared/assets/fonts/Montserrat-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../shared/assets/fonts/Montserrat-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../shared/assets/fonts/Montserrat-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../shared/assets/fonts/Montserrat-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-montserrat",
});

const tradeGothic = localFont({
  src: "../shared/assets/fonts/TradeGothicLTStd-Extended.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-trade-gothic",
});

export const metadata: Metadata = {
  title: "NazAIRo",
  description:
    "Web application for buying airline tickets and booking accommodation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${tradeGothic.variable} antialiased`}
      suppressHydrationWarning={true}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
