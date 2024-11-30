'use client';

import { Flex, Box } from "@chakra-ui/react";
import Navbar from "./Navbar";
import { Footer } from "./Footer";
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const PUBLIC_ROUTES = ['/login', '/payment'];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));
    setShowNav(!isPublicRoute);
  }, [pathname, mounted]);

  // Prevent flash of navbar on public routes
  if (!mounted) {
    return (
      <Flex direction="column" minH="100vh">
        <Box flex="1">{children}</Box>
      </Flex>
    );
  }

  return (
    <Flex direction="column" minH="100vh">
      {showNav && <Navbar />}
      <Box flex="1">
        {children}
      </Box>
      {showNav && <Footer />}
    </Flex>
  );
}
