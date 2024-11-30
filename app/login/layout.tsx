'use client';

import { Box, useColorModeValue, Flex } from '@chakra-ui/react';
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
