import { Box, Flex, Icon, StatLabel, StatNumber, StatHelpText, Stat, HStack, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const MotionBox = motion(Box);

interface StatCardProps {
  title: string;
  stat: string | number;
  icon: any;
  helpText?: string;
  type?: 'increase' | 'decrease';
  percentage?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  stat,
  icon,
  helpText,
  type,
  percentage,
}) => {
  const bgGradient = useColorModeValue(
    'linear(to-r, white, gray.50)',
    'linear(to-r, gray.800, gray.700)'
  );
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const iconBg = useColorModeValue('gray.100', 'gray.700');
  const statColor = type === 'increase' ? 'green.500' : 'red.500';

  return (
    <MotionBox
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Stat
        px={{ base: 4, md: 8 }}
        py={5}
        bgGradient={bgGradient}
        shadow="xl"
        border="1px"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        rounded="xl"
      >
        <Flex justifyContent="space-between">
          <Box pl={2}>
            <StatLabel fontWeight="medium" isTruncated>
              {title}
            </StatLabel>
            <StatNumber fontSize="2xl" fontWeight="bold">
              {stat}
            </StatNumber>
            <HStack spacing={2}>
              <Icon 
                as={type === 'increase' ? FiTrendingUp : FiTrendingDown} 
                color={statColor}
              />
              <StatHelpText 
                color={statColor}
                fontWeight="bold"
              >
                {percentage}
              </StatHelpText>
              {helpText && (
                <StatHelpText color={textColor}>
                  {helpText}
                </StatHelpText>
              )}
            </HStack>
          </Box>
          <Box
            my="auto"
            color={useColorModeValue('purple.600', 'purple.200')}
            alignContent="center"
          >
            <Icon as={icon} w={8} h={8} />
          </Box>
        </Flex>
      </Stat>
    </MotionBox>
  );
}
