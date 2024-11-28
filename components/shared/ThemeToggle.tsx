'use client';

import { IconButton, useColorMode, useColorModeValue } from '@chakra-ui/react';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { motion } from 'framer-motion';

const MotionIconButton = motion(IconButton);

export default function ThemeToggle() {
  const { toggleColorMode } = useColorMode();
  const SwitchIcon = useColorModeValue(MoonIcon, SunIcon);
  const iconColor = useColorModeValue('purple.600', 'yellow.300');

  return (
    <MotionIconButton
      aria-label={useColorModeValue('Dunkelmodus aktivieren', 'Hellmodus aktivieren')}
      icon={<SwitchIcon />}
      variant="ghost"
      color={iconColor}
      onClick={toggleColorMode}
      _hover={{
        bg: useColorModeValue('purple.50', 'rgba(255, 255, 255, 0.1)'),
      }}
      whileHover={{ 
        scale: 1.1,
        rotate: 180,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.95 }}
      initial={{ rotate: 0 }}
      animate={{
        rotate: useColorModeValue(0, 180),
        transition: { duration: 0.3 }
      }}
    />
  );
}
