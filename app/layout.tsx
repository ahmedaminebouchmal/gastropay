import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ChakraProvider } from "@/providers/Chakra";
import { ColorModeScript, Flex, Box } from "@chakra-ui/react";
import theme from "@/lib/theme";
import Navbar from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

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
          <Flex direction="column" minH="100vh">
            <Navbar />
            <Box flex="1">
              {children}
            </Box>
            <Footer />
          </Flex>
        </ChakraProvider>
      </body>
    </html>
  );
}
