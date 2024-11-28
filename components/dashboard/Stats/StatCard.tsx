import { Box, Flex, Icon, StatLabel, StatNumber, StatHelpText, Stat, HStack, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const MotionBox = motion(Box);

interface StatCardProps {
  title: string;
  stat: string;
  icon: any;
  helpText?: string;
  trend?: 'up' | 'down';
  percentage?: string;
}

export function StatCard({ title, stat, icon, helpText, trend, percentage }: StatCardProps) {
  const bgGradient = useColorModeValue(
    'linear(to-r, white, gray.50)',
    'linear(to-r, gray.800, gray.700)'
  );
  
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
                as={trend === 'up' ? FiTrendingUp : FiTrendingDown} 
                color={trend === 'up' ? 'green.500' : 'red.500'}
              />
              <StatHelpText 
                color={trend === 'up' ? 'green.500' : 'red.500'}
                fontWeight="bold"
              >
                {percentage}
              </StatHelpText>
              {helpText && (
                <StatHelpText color={useColorModeValue('gray.600', 'gray.400')}>
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
