import { Button, ButtonProps } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { translations } from '@/translations/de';

const MotionButton = motion(Button);

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
  children: React.ReactNode;
}

export default function LoadingButton({ isLoading, children, ...props }: LoadingButtonProps) {
  const [loadingDots, setLoadingDots] = useState('');
  const { login: t } = translations;

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingDots(prev => (prev.length >= 3 ? '' : prev + '.'));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const buttonVariants = useMemo(() => ({
    idle: {
      scale: 1,
      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
    },
    loading: {
      scale: 0.98,
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.3,
      },
    },
    tap: {
      scale: 0.95,
    },
  }), []);

  const buttonTransition = useMemo(() => ({
    duration: 0.3,
    backgroundPosition: {
      duration: 3,
      repeat: Infinity,
      ease: "linear",
    },
  }), []);

  return (
    <MotionButton
      {...props}
      initial="idle"
      animate={isLoading ? "loading" : "idle"}
      whileHover="hover"
      whileTap="tap"
      variants={buttonVariants}
      transition={buttonTransition}
      bgGradient="linear(to-r, purple.500, pink.500, purple.500)"
      backgroundSize="200% 100%"
      color="white"
      _hover={{
        bgGradient: "linear(to-r, purple.600, pink.600, purple.600)",
      }}
      _active={{
        bgGradient: "linear(to-r, purple.700, pink.700, purple.700)",
      }}
    >
      {isLoading ? `${t.signingIn}${loadingDots}` : children}
    </MotionButton>
  );
}
