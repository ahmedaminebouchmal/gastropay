'use client';

import {
  Box,
  Flex,
  Text,
  useColorModeValue,
  Container,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Button,
  Icon,
  Stack,
  HStack,
  VStack,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Progress,
  Heading,
} from '@chakra-ui/react';
import { FiUsers, FiDollarSign, FiShoppingBag, FiActivity, FiLogOut, FiBell, FiSettings, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { motion } from 'framer-motion';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { useRouter } from 'next/navigation';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { translations } from '@/translations/de';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MotionBox = motion(Box);

interface StatCardProps {
  title: string;
  stat: string;
  icon: any;
  helpText?: string;
  trend?: 'up' | 'down';
  percentage?: string;
}

function StatCard({ title, stat, icon, helpText, trend, percentage }: StatCardProps) {
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

const chartData = {
  labels: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun'],
  datasets: [
    {
      label: translations.dashboard.revenue,
      data: [30, 45, 38, 52, 48, 60],
      borderColor: 'rgb(147, 51, 234)',
      tension: 0.4,
    },
  ],
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

const recentTransactions = [
  { id: 1, user: 'John Doe', amount: '250,00 €', status: 'completed', date: '20.01.2024' },
  { id: 2, user: 'Jane Smith', amount: '180,50 €', status: 'pending', date: '19.01.2024' },
  { id: 3, user: 'Mike Johnson', amount: '420,00 €', status: 'completed', date: '18.01.2024' },
  { id: 4, user: 'Sarah Wilson', amount: '150,75 €', status: 'failed', date: '18.01.2024' },
];

export default function DashboardPage() {
  const router = useRouter();
  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: translations.dashboard.logout,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        router.push('/login');
      } else {
        toast({
          title: 'Logout fehlgeschlagen',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Box minH="100vh" bg={bgColor}>
      {/* Navbar */}
      <Flex
        as="nav"
        align="center"
        justify="space-between"
        py={4}
        px={8}
        bg={useColorModeValue('white', 'gray.800')}
        borderBottom="1px"
        borderColor={borderColor}
        shadow="sm"
      >
        <HStack spacing={8}>
          <Text 
            fontSize="2xl" 
            fontWeight="bold" 
            bgGradient="linear(to-r, purple.500, pink.500)" 
            bgClip="text"
          >
            Gastropay
          </Text>
        </HStack>

        <HStack spacing={4}>
          <ThemeToggle />
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              size="md"
              aria-label={translations.dashboard.notifications}
              position="relative"
            >
              <Icon as={FiBell} />
              <Box
                position="absolute"
                top="-1px"
                right="-1px"
                px={2}
                py={1}
                fontSize="xs"
                fontWeight="bold"
                lineHeight="none"
                color="white"
                transform="translate(50%,-50%)"
                bg="red.500"
                rounded="full"
              >
                3
              </Box>
            </MenuButton>
            <MenuList>
              <MenuItem>{translations.dashboard.newOrder} #123</MenuItem>
              <MenuItem>{translations.dashboard.paymentReceived}</MenuItem>
              <MenuItem>{translations.dashboard.systemUpdate}</MenuItem>
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton
              as={Button}
              rounded="full"
              variant="link"
              cursor="pointer"
              minW={0}
            >
              <Avatar 
                size="sm" 
                src="https://bit.ly/dan-abramov"
                name="Admin User"
              />
            </MenuButton>
            <MenuList>
              <MenuItem icon={<FiSettings />}>{translations.dashboard.settings}</MenuItem>
              <Divider />
              <MenuItem icon={<FiLogOut />} onClick={handleLogout}>
                {translations.dashboard.logout}
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      {/* Main Content */}
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Stats Grid */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <StatCard
              title={translations.dashboard.totalUsers}
              stat="4.000"
              icon={FiUsers}
              trend="up"
              percentage="+21%"
              helpText={translations.dashboard.vsLastMonth}
            />
            <StatCard
              title={translations.dashboard.revenue}
              stat="34.890 €"
              icon={FiDollarSign}
              trend="up"
              percentage="+15%"
              helpText={translations.dashboard.vsLastMonth}
            />
            <StatCard
              title={translations.dashboard.orders}
              stat="876"
              icon={FiShoppingBag}
              trend="up"
              percentage="+8%"
              helpText={translations.dashboard.vsLastMonth}
            />
            <StatCard
              title={translations.dashboard.conversion}
              stat="3,2%"
              icon={FiActivity}
              trend="down"
              percentage="-2%"
              helpText={translations.dashboard.vsLastMonth}
            />
          </SimpleGrid>

          {/* Chart and Activity Section */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
            {/* Revenue Chart */}
            <Box
              bg={cardBg}
              p={6}
              rounded="xl"
              shadow="xl"
              border="1px"
              borderColor={borderColor}
            >
              <VStack align="stretch" spacing={4}>
                <Heading size="md">{translations.dashboard.revenueOverview}</Heading>
                <Box h="300px">
                  <Line data={chartData} options={chartOptions} />
                </Box>
              </VStack>
            </Box>

            {/* Recent Transactions */}
            <Box
              bg={cardBg}
              p={6}
              rounded="xl"
              shadow="xl"
              border="1px"
              borderColor={borderColor}
            >
              <VStack align="stretch" spacing={4}>
                <Heading size="md">{translations.dashboard.recentTransactions}</Heading>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>{translations.dashboard.user}</Th>
                      <Th>{translations.dashboard.amount}</Th>
                      <Th>{translations.dashboard.status}</Th>
                      <Th>{translations.dashboard.date}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {recentTransactions.map((transaction) => (
                      <Tr key={transaction.id}>
                        <Td>{transaction.user}</Td>
                        <Td>{transaction.amount}</Td>
                        <Td>
                          <Badge
                            colorScheme={
                              transaction.status === 'completed'
                                ? 'green'
                                : transaction.status === 'pending'
                                ? 'yellow'
                                : 'red'
                            }
                          >
                            {translations.dashboard[transaction.status]}
                          </Badge>
                        </Td>
                        <Td>{transaction.date}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </VStack>
            </Box>
          </SimpleGrid>

          {/* Performance Metrics */}
          <Box
            bg={cardBg}
            p={6}
            rounded="xl"
            shadow="xl"
            border="1px"
            borderColor={borderColor}
          >
            <VStack align="stretch" spacing={4}>
              <Heading size="md">{translations.dashboard.performanceMetrics}</Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                <Box>
                  <Text mb={2}>{translations.dashboard.customerSatisfaction}</Text>
                  <Progress value={85} colorScheme="purple" rounded="full" />
                  <Text mt={2} fontSize="sm" color="gray.500">85% {translations.dashboard.positiveReviews}</Text>
                </Box>
                <Box>
                  <Text mb={2}>{translations.dashboard.orderCompletionRate}</Text>
                  <Progress value={92} colorScheme="green" rounded="full" />
                  <Text mt={2} fontSize="sm" color="gray.500">92% {translations.dashboard.successRate}</Text>
                </Box>
              </SimpleGrid>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
