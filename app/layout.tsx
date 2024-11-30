import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ChakraProvider } from "@/providers/Chakra";
import { ColorModeScript } from "@chakra-ui/react";
import theme from "@/lib/theme";
import ClientLayout from "@/components/shared/ClientLayout";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Gatsropay",
  description: "Payment solution platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <ChakraProvider>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <ClientLayout>
            {children}
          </ClientLayout>
        </ChakraProvider>
      </body>
    </html>
  );
}
