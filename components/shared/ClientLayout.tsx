'use client';

import { Flex, Box } from "@chakra-ui/react";
import Navbar from "./Navbar";
import { Footer } from "./Footer";
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    const isPublicRoute = pathname === '/login' || pathname?.startsWith('/payment/');
    setShowNav(!isPublicRoute);
  }, [pathname]);

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
