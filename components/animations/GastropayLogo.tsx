import { Box, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

export default function GastropayLogo() {
  const logoColor = useColorModeValue('purple.600', 'purple.300');
  
  const containerVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.5
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const circleVariants = {
    hidden: { 
      opacity: 0,
      scale: 0
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const letterVariants = {
    hidden: { 
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <MotionBox
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      mb={6}
    >
      {/* Animated Logo Mark */}
      <MotionBox
        variants={circleVariants}
        width="80px"
        height="80px"
        borderRadius="full"
        position="relative"
        bgGradient="linear(to-r, purple.500, pink.500)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        mb={4}
        whileHover={{ 
          scale: 1.05,
          rotate: 360,
          transition: { duration: 0.8 }
        }}
      >
        <MotionBox
          as="span"
          fontSize="3xl"
          fontWeight="bold"
          color="white"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            transition: { delay: 0.5 }
          }}
        >
          G
        </MotionBox>
        
        {/* Animated circles */}
        {[0, 1, 2].map((index) => (
          <MotionBox
            key={index}
            position="absolute"
            width="100%"
            height="100%"
            borderRadius="full"
            border="2px solid"
            borderColor={logoColor}
            initial={{ opacity: 0.3 }}
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.4,
              ease: "easeInOut"
            }}
          />
        ))}
      </MotionBox>

      {/* Animated Text */}
      <MotionBox
        variants={letterVariants}
        bgGradient="linear(to-r, purple.500, pink.500)"
        bgClip="text"
        fontSize="4xl"
        fontWeight="extrabold"
        textAlign="center"
        whileHover={{ scale: 1.05 }}
      >
        Gastropay
      </MotionBox>
    </MotionBox>
  );
}
