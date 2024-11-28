'use client';

import {
  Box,
  Container,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  VStack,
  Heading,
  Badge,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  FiUsers,
  FiDollarSign,
  FiShoppingBag,
  FiActivity,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
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
        <Box pl={2}>
          <StatLabel fontWeight="medium" isTruncated>
            {title}
          </StatLabel>
          <StatNumber fontSize="2xl" fontWeight="bold">
            {stat}
          </StatNumber>
          {(trend || percentage) && (
            <StatHelpText 
              color={trend === 'up' ? 'green.500' : 'red.500'}
              display="flex"
              alignItems="center"
              gap={1}
            >
              {trend === 'up' ? <FiTrendingUp /> : <FiTrendingDown />}
              {percentage}
              {helpText && (
                <Box as="span" color={useColorModeValue('gray.600', 'gray.400')}>
                  {helpText}
                </Box>
              )}
            </StatHelpText>
          )}
        </Box>
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

const transactions = [
  { id: 1, user: 'Thomas Müller', amount: '250,00 €', status: 'completed', date: '20.01.2024' },
  { id: 2, user: 'Anna Schmidt', amount: '180,50 €', status: 'pending', date: '19.01.2024' },
  { id: 3, user: 'Michael Weber', amount: '420,00 €', status: 'completed', date: '18.01.2024' },
  { id: 4, user: 'Sophie Wagner', amount: '150,75 €', status: 'failed', date: '18.01.2024' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'green';
    case 'pending':
      return 'yellow';
    case 'failed':
      return 'red';
    default:
      return 'gray';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Abgeschlossen';
    case 'pending':
      return 'In Bearbeitung';
    case 'failed':
      return 'Fehlgeschlagen';
    default:
      return status;
  }
};

export default function DashboardPage() {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.900', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.900', 'white');
  const statBg = useColorModeValue('gray.50', 'gray.700');

  return (
    <Box minH="100vh" bg={bgColor}>
      {/* Main Content */}
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Stats Grid */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Box
              p={6}
              bg={cardBg}
              borderRadius="xl"
              boxShadow="sm"
              border="1px"
              borderColor={borderColor}
            >
              <Stat>
                <StatLabel color={mutedTextColor} fontSize="sm" fontWeight="medium">
                  Gesamtbenutzer
                </StatLabel>
                <StatNumber color={headingColor} fontSize="2xl" fontWeight="bold" mt={2}>
                  4.000
                </StatNumber>
                <StatHelpText color="green.500" fontWeight="medium">
                  <Text as="span" color="green.500">+21%</Text>
                  {' '}
                  <Text as="span" color={mutedTextColor} fontSize="sm">
                    vs. letzter Monat
                  </Text>
                </StatHelpText>
              </Stat>
            </Box>

            <Box
              p={6}
              bg={cardBg}
              borderRadius="xl"
              boxShadow="sm"
              border="1px"
              borderColor={borderColor}
            >
              <Stat>
                <StatLabel color={mutedTextColor} fontSize="sm" fontWeight="medium">
                  Einnahmen
                </StatLabel>
                <StatNumber color={headingColor} fontSize="2xl" fontWeight="bold" mt={2}>
                  34.890 €
                </StatNumber>
                <StatHelpText color="green.500" fontWeight="medium">
                  <Text as="span" color="green.500">+15%</Text>
                  {' '}
                  <Text as="span" color={mutedTextColor} fontSize="sm">
                    vs. letzter Monat
                  </Text>
                </StatHelpText>
              </Stat>
            </Box>

            <Box
              p={6}
              bg={cardBg}
              borderRadius="xl"
              boxShadow="sm"
              border="1px"
              borderColor={borderColor}
            >
              <Stat>
                <StatLabel color={mutedTextColor} fontSize="sm" fontWeight="medium">
                  Bestellungen
                </StatLabel>
                <StatNumber color={headingColor} fontSize="2xl" fontWeight="bold" mt={2}>
                  876
                </StatNumber>
                <StatHelpText color="green.500" fontWeight="medium">
                  <Text as="span" color="green.500">+8%</Text>
                  {' '}
                  <Text as="span" color={mutedTextColor} fontSize="sm">
                    vs. letzter Monat
                  </Text>
                </StatHelpText>
              </Stat>
            </Box>

            <Box
              p={6}
              bg={cardBg}
              borderRadius="xl"
              boxShadow="sm"
              border="1px"
              borderColor={borderColor}
            >
              <Stat>
                <StatLabel color={mutedTextColor} fontSize="sm" fontWeight="medium">
                  Konversionsrate
                </StatLabel>
                <StatNumber color={headingColor} fontSize="2xl" fontWeight="bold" mt={2}>
                  3,2%
                </StatNumber>
                <StatHelpText color="red.500" fontWeight="medium">
                  <Text as="span" color="red.500">-2%</Text>
                  {' '}
                  <Text as="span" color={mutedTextColor} fontSize="sm">
                    vs. letzter Monat
                  </Text>
                </StatHelpText>
              </Stat>
            </Box>
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

          {/* Transactions Table */}
          <Box
            bg={cardBg}
            borderRadius="xl"
            boxShadow="sm"
            border="1px"
            borderColor={borderColor}
            overflow="hidden"
          >
            <Box p={6} borderBottom="1px" borderColor={borderColor}>
              <Heading size="md" color={headingColor} fontWeight="semibold">
                Aktuelle Transaktionen
              </Heading>
            </Box>
            <Box>
              <Table variant="simple">
                <Thead bg={useColorModeValue('gray.50', 'gray.900')}>
                  <Tr>
                    <Th
                      borderColor={borderColor}
                      color={mutedTextColor}
                      fontWeight="medium"
                      py={4}
                    >
                      Benutzer
                    </Th>
                    <Th
                      borderColor={borderColor}
                      color={mutedTextColor}
                      fontWeight="medium"
                      py={4}
                    >
                      Betrag
                    </Th>
                    <Th
                      borderColor={borderColor}
                      color={mutedTextColor}
                      fontWeight="medium"
                      py={4}
                    >
                      Status
                    </Th>
                    <Th
                      borderColor={borderColor}
                      color={mutedTextColor}
                      fontWeight="medium"
                      py={4}
                    >
                      Datum
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {transactions.map((transaction) => (
                    <Tr 
                      key={transaction.id}
                      _hover={{ bg: useColorModeValue('gray.50', 'gray.800') }}
                      transition="background 0.2s"
                    >
                      <Td 
                        borderColor={borderColor}
                        py={4}
                      >
                        <Text color={textColor} fontWeight="medium">
                          {transaction.user}
                        </Text>
                      </Td>
                      <Td 
                        borderColor={borderColor}
                        py={4}
                      >
                        <Text color={textColor} fontWeight="medium" fontFamily="var(--font-geist-mono)">
                          {transaction.amount}
                        </Text>
                      </Td>
                      <Td 
                        borderColor={borderColor}
                        py={4}
                      >
                        <Badge
                          colorScheme={getStatusColor(transaction.status)}
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontSize="sm"
                          textTransform="none"
                          fontWeight="medium"
                        >
                          {getStatusText(transaction.status)}
                        </Badge>
                      </Td>
                      <Td 
                        borderColor={borderColor}
                        py={4}
                      >
                        <Text color={mutedTextColor} fontFamily="var(--font-geist-mono)">
                          {transaction.date}
                        </Text>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>

          {/* Performance Metrics */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Box
              p={6}
              bg={cardBg}
              borderRadius="xl"
              boxShadow="sm"
              border="1px"
              borderColor={borderColor}
            >
              <VStack align="stretch" spacing={4}>
                <Heading size="sm" color={headingColor} fontWeight="semibold">
                  Kundenzufriedenheit
                </Heading>
                <Text color={textColor} fontSize="2xl" fontWeight="bold">
                  85%
                </Text>
                <Progress value={85} colorScheme="green" borderRadius="full" />
                <Text color={mutedTextColor} fontSize="sm">
                  Positive Bewertungen
                </Text>
              </VStack>
            </Box>

            <Box
              p={6}
              bg={cardBg}
              borderRadius="xl"
              boxShadow="sm"
              border="1px"
              borderColor={borderColor}
            >
              <VStack align="stretch" spacing={4}>
                <Heading size="sm" color={headingColor} fontWeight="semibold">
                  Bestellabschlussrate
                </Heading>
                <Text color={textColor} fontSize="2xl" fontWeight="bold">
                  92%
                </Text>
                <Progress value={92} colorScheme="brand" borderRadius="full" />
                <Text color={mutedTextColor} fontSize="sm">
                  Erfolgsrate
                </Text>
              </VStack>
            </Box>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
