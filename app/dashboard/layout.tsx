'use client';

import { Box, useColorModeValue } from '@chakra-ui/react';
import Navbar from '@/components/shared/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  return (
    <Box minH="100vh" bg={bgColor}>
      <Navbar />
      <Box pt="64px" px={4}>
        {children}
      </Box>
    </Box>
  );
}