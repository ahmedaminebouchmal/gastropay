'use client';

import { Flex, Box } from "@chakra-ui/react";
import Navbar from "./Navbar";
import { Footer } from "./Footer";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isPublicRoute = pathname === '/login' || pathname?.startsWith('/payment/');

  return (
    <Flex direction="column" minH="100vh">
      {!isPublicRoute && <Navbar />}
      <Box flex="1">
        {children}
      </Box>
      {!isPublicRoute && <Footer />}
    </Flex>
  );
}
