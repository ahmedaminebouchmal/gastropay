'use client';

import { Box, Flex } from '@chakra-ui/react';
import Navbar from './Navbar';
import { Footer } from './Footer';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';

// Routes that should not show the default navigation
const EXCLUDED_ROUTES = ['/login', '/dashboard'];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const shouldExcludeNav = useMemo(() => {
    if (!pathname) return true;
    return EXCLUDED_ROUTES.some(route => pathname.startsWith(route));
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // If we're on an excluded route (like dashboard), just render children
  if (shouldExcludeNav) {
    return <>{children}</>;
  }

  // For all other routes, wrap with nav and footer
  return (
    <Flex direction="column" minH="100vh">
      <Navbar />
      <Box flex="1" w="full">
        {children}
      </Box>
      <Footer />
    </Flex>
  );
}
