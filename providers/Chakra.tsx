'use client';

import { ChakraProvider as ChakraUIProvider } from '@chakra-ui/react';
import { CacheProvider } from '@chakra-ui/next-js';
import theme from '@/lib/theme';

export function ChakraProvider({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider>
      <ChakraUIProvider theme={theme} resetCSS>
        {children}
      </ChakraUIProvider>
    </CacheProvider>
  );
}
