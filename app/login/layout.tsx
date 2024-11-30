'use client';

import { Box, useColorModeValue, Tooltip, Flex } from '@chakra-ui/react';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  return (
    <MotionBox 
      minH="100vh" 
      bg={bgColor} 
      position="relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Theme Toggle Button */}
      <Box 
        position="absolute" 
        top={0} 
        right={0} 
        p={4}
        bg="gray.900"
        borderBottomLeftRadius="md"
      >
        <ThemeToggle />
      </Box>

      {/* Main Content */}
      <MotionFlex 
        minH="100vh" 
        align="center" 
        justify="center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {children}
      </MotionFlex>
    </MotionBox>
  );
}
