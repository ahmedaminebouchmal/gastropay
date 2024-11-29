'use client';

import {
  Box,
  Container,
  SimpleGrid,
  useColorModeValue,
  VStack,
  Heading,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Center,
  HStack,
  Select,
  Text,
  Avatar,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Link,
  Button
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiUsers, FiDollarSign, FiShoppingCart, FiActivity, FiMail, FiPhone, FiMoreVertical } from 'react-icons/fi';
import { translations } from '@/translations/de';
import { useState, useEffect, useMemo } from 'react';
import { Payment, PaymentStatus } from '@/types/payment';
import { Client } from '@/types/client';
import { RevenueChart } from '@/components/dashboard/Charts/RevenueChart';
import { TransactionsTable } from '@/components/dashboard/Tables/TransactionsTable';
import { StatCard } from '@/components/dashboard/Stats/StatCard';
import NextLink from 'next/link';

const MotionBox = motion(Box);

const getStatusColor = (status: PaymentStatus) => {
  switch (status) {
    case PaymentStatus.PAID:
      return 'green';
    case PaymentStatus.PENDING:
      return 'yellow';
    case PaymentStatus.DECLINED:
      return 'red';
    default:
      return 'gray';
  }
};

const getStatusText = (status: PaymentStatus) => {
  switch (status) {
    case PaymentStatus.PAID:
      return 'Bezahlt';
    case PaymentStatus.PENDING:
      return 'Ausstehend';
    case PaymentStatus.DECLINED:
      return 'Abgelehnt';
    default:
      return status;
  }
};

const formatCurrency = (amount: number, currency: string = 'EUR') => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

const calculateGrowth = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

const getLastSixMonths = (timeRange: string) => {
  const months = [];
  const currentDate = new Date();
  let startDate = new Date();
  
  switch (timeRange) {
    case 'lastWeek':
      // For last week, show daily data
      for (let i = 6; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() - i);
        months.push(date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }));
      }
      break;
    case 'lastMonth':
      // For last month, show weekly data
      for (let i = 3; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() - (i * 7));
        months.push(`KW ${getWeekNumber(date)}`);
      }
      break;
    case 'lastYear':
      // For last year, show monthly data
      for (let i = 11; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        months.push(date.toLocaleDateString('de-DE', { month: 'short', year: 'numeric' }));
      }
      break;
    default:
      // Default to last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        months.push(date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }));
      }
  }
  
  return months;
};

const getWeekNumber = (date: Date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

const getRevenueData = (payments: Payment[], timeRange: string) => {
  const now = new Date();
  let startDate = new Date();
  const labels = getLastSixMonths(timeRange);
  const data = new Array(labels.length).fill(0);

  switch (timeRange) {
    case 'lastWeek':
      startDate.setDate(now.getDate() - 7);
      payments.forEach(payment => {
        const paymentDate = new Date(payment.createdAt);
        if (paymentDate >= startDate) {
          const dayIndex = labels.indexOf(paymentDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }));
          if (dayIndex !== -1) {
            data[dayIndex] += payment.amount;
          }
        }
      });
      break;
    case 'lastMonth':
      startDate.setDate(now.getDate() - 28);
      payments.forEach(payment => {
        const paymentDate = new Date(payment.createdAt);
        if (paymentDate >= startDate) {
          const weekNum = `KW ${getWeekNumber(paymentDate)}`;
          const weekIndex = labels.indexOf(weekNum);
          if (weekIndex !== -1) {
            data[weekIndex] += payment.amount;
          }
        }
      });
      break;
    case 'lastYear':
      startDate.setFullYear(now.getFullYear() - 1);
      payments.forEach(payment => {
        const paymentDate = new Date(payment.createdAt);
        if (paymentDate >= startDate) {
          const monthLabel = paymentDate.toLocaleDateString('de-DE', { month: 'short', year: 'numeric' });
          const monthIndex = labels.indexOf(monthLabel);
          if (monthIndex !== -1) {
            data[monthIndex] += payment.amount;
          }
        }
      });
      break;
    default:
      startDate.setMonth(now.getMonth() - 6);
      payments.forEach(payment => {
        const paymentDate = new Date(payment.createdAt);
        if (paymentDate >= startDate) {
          const monthLabel = paymentDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
          const monthIndex = labels.indexOf(monthLabel);
          if (monthIndex !== -1) {
            data[monthIndex] += payment.amount;
          }
        }
      });
  }

  return { labels, data };
};

export default function DashboardPage() {
  // Color mode hooks first
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const clientBgColor = useColorModeValue('gray.50', 'gray.700');
  const chartLineColor = useColorModeValue('#553C9A', '#B794F4');
  const chartBgColor = useColorModeValue(
    'rgba(85, 60, 154, 0.08)',
    'rgba(183, 148, 244, 0.08)'
  );
  const chartPointBorderColor = useColorModeValue('#FFFFFF', '#1A202C');

  // State hooks
  const [timeRange, setTimeRange] = useState('lastMonth');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Data fetching effect
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [paymentsRes, clientsRes] = await Promise.all([
          fetch('/api/payments'),
          fetch('/api/clients')
        ]);

        if (!paymentsRes.ok || !clientsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const [paymentsData, clientsData] = await Promise.all([
          paymentsRes.json(),
          clientsRes.json()
        ]);

        setPayments(paymentsData);
        setClients(clientsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Memoized stats calculation
  const stats = useMemo(() => {
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case 'lastWeek':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'lastMonth':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'lastYear':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    const filteredPayments = payments.filter(p => new Date(p.createdAt) >= startDate);
    const filteredClients = clients.filter(c => new Date(c.createdAt) >= startDate);

    const previousStartDate = new Date(startDate);
    const timeDiff = now.getTime() - startDate.getTime();
    previousStartDate.setTime(previousStartDate.getTime() - timeDiff);

    const previousPeriodPayments = payments.filter(p => {
      const date = new Date(p.createdAt);
      return date >= previousStartDate && date < startDate;
    });

    const previousPeriodClients = clients.filter(c => {
      const date = new Date(c.createdAt);
      return date >= previousStartDate && date < startDate;
    });

    const currentPeriodRevenue = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
    const previousPeriodRevenue = previousPeriodPayments.reduce((sum, p) => sum + p.amount, 0);

    const revenueData = getRevenueData(payments, timeRange);

    const recentTransactions = filteredPayments
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(payment => ({
        id: payment._id.toString(),
        client: payment.clientId && typeof payment.clientId === 'object' && 'fullName' in payment.clientId 
          ? payment.clientId.fullName 
          : 'Unknown',
        amount: formatCurrency(payment.amount, payment.currency),
        status: payment.status,
        date: formatDate(payment.createdAt)
      }));

    return {
      totalClients: filteredClients.length,
      totalRevenue: currentPeriodRevenue,
      revenueGrowth: calculateGrowth(currentPeriodRevenue, previousPeriodRevenue),
      totalTransactions: filteredPayments.length,
      transactionGrowth: calculateGrowth(
        filteredPayments.length,
        previousPeriodPayments.length
      ),
      clientGrowth: calculateGrowth(
        filteredClients.length,
        previousPeriodClients.length
      ),
      activityRate: Math.round(
        (filteredPayments.length / Math.max(filteredClients.length, 1)) * 100
      ),
      monthlyRevenue: revenueData.data,
      monthLabels: revenueData.labels,
      recentTransactions
    };
  }, [payments, clients, timeRange]);

  if (isLoading) {
    return (
      <Center minH="100vh" bg={bgColor}>
        <Spinner size="xl" color="purple.500" thickness="4px" />
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header with Time Range Selector */}
          <Flex justify="space-between" align="center">
            <Heading size="lg">{translations.dashboard.title}</Heading>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              w="200px"
              size="sm"
            >
              <option value="lastWeek">{translations.dashboard.timeRange.lastWeek}</option>
              <option value="lastMonth">{translations.dashboard.timeRange.lastMonth}</option>
              <option value="lastYear">{translations.dashboard.timeRange.lastYear}</option>
            </Select>
          </Flex>

          {/* Stats Grid */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <StatCard
              title={translations.dashboard.totalClients}
              stat={stats?.totalClients || 0}
              icon={FiUsers}
              type={stats?.clientGrowth > 0 ? 'increase' : 'decrease'}
              percentage={Math.abs(stats?.clientGrowth || 0)}
              helpText={translations.dashboard.vsLastMonth}
            />
            <StatCard
              title={translations.dashboard.totalRevenue}
              stat={formatCurrency(stats?.totalRevenue || 0, 'EUR')}
              icon={FiDollarSign}
              type={stats?.revenueGrowth > 0 ? 'increase' : 'decrease'}
              percentage={Math.abs(stats?.revenueGrowth || 0)}
              helpText={translations.dashboard.vsLastMonth}
            />
            <StatCard
              title={translations.dashboard.totalTransactions}
              stat={stats?.totalTransactions || 0}
              icon={FiShoppingCart}
              type={stats?.transactionGrowth > 0 ? 'increase' : 'decrease'}
              percentage={Math.abs(stats?.transactionGrowth || 0)}
              helpText={translations.dashboard.vsLastMonth}
            />
            <StatCard
              title={translations.dashboard.activityRate}
              stat={`${stats?.activityRate || 0}%`}
              icon={FiActivity}
              type={stats?.activityRate > 0 ? 'increase' : 'decrease'}
              percentage={Math.abs(stats?.activityRate || 0)}
              helpText={translations.dashboard.vsLastMonth}
            />
          </SimpleGrid>

          {/* Main Content Grid */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
            {/* Left Column */}
            <VStack spacing={8} align="stretch">
              {/* Revenue Chart */}
              <Box
                p={6}
                bg={cardBg}
                rounded="xl"
                shadow="xl"
                border="1px"
                borderColor={borderColor}
              >
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">{translations.dashboard.revenueOverview}</Heading>
                  <Box h="300px">
                    <RevenueChart
                      data={{
                        labels: stats?.monthLabels || [],
                        datasets: [
                          {
                            label: translations.dashboard.totalRevenue,
                            data: stats?.monthlyRevenue || [],
                            borderColor: chartLineColor,
                            backgroundColor: chartBgColor,
                            pointBackgroundColor: chartLineColor,
                            pointBorderColor: chartPointBorderColor,
                            pointHoverBackgroundColor: chartPointBorderColor,
                            pointHoverBorderColor: chartLineColor,
                            pointBorderWidth: 2,
                            pointHoverBorderWidth: 3,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            borderWidth: 3,
                            tension: 0.4,
                            fill: true
                          }
                        ]
                      }}
                    />
                  </Box>
                </VStack>
              </Box>

              {/* Recent Transactions */}
              <Box
                p={6}
                bg={cardBg}
                rounded="xl"
                shadow="xl"
                border="1px"
                borderColor={borderColor}
              >
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">{translations.dashboard.recentTransactions}</Heading>
                  <TransactionsTable
                    transactions={stats?.recentTransactions.map((t, index) => ({
                      id: index,
                      user: t.client,
                      amount: t.amount,
                      status: t.status === PaymentStatus.PAID ? 'completed' : 
                             t.status === PaymentStatus.PENDING ? 'pending' : 'failed',
                      date: t.date
                    }))}
                  />
                </VStack>
              </Box>
            </VStack>

            {/* Right Column */}
            <VStack spacing={8} align="stretch">
              {/* Recent Clients */}
              <Box
                p={6}
                bg={cardBg}
                rounded="xl"
                shadow="xl"
                border="1px"
                borderColor={borderColor}
              >
                <VStack align="stretch" spacing={4}>
                  <Flex justify="space-between" align="center">
                    <Heading size="md">{translations.dashboard.recentClients}</Heading>
                    <Button
                      as={NextLink}
                      href="/dashboard/clients"
                      colorScheme="purple"
                      variant="ghost"
                      size="sm"
                    >
                      {translations.dashboard.viewAll}
                    </Button>
                  </Flex>
                  <VStack spacing={4} align="stretch">
                    {clients
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 5)
                      .map((client) => (
                        <Box
                          key={client._id.toString()}
                          p={4}
                          bg={clientBgColor}
                          rounded="lg"
                          transition="all 0.2s"
                          _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                        >
                          <Flex justify="space-between" align="center">
                            <HStack spacing={4}>
                              <Avatar
                                name={client.fullName}
                                size="sm"
                                bg="purple.500"
                              />
                              <Box>
                                <Text fontWeight="medium">{client.fullName}</Text>
                                <Text fontSize="sm" color={mutedColor}>
                                  {client.company || 'Privatkunde'}
                                </Text>
                              </Box>
                            </HStack>
                            <HStack spacing={4}>
                              <IconButton
                                as="a"
                                href={`mailto:${client.email}`}
                                aria-label="Send email"
                                icon={<FiMail />}
                                variant="ghost"
                                size="sm"
                              />
                              <IconButton
                                as="a"
                                href={`tel:${client.phoneNumber}`}
                                aria-label="Call"
                                icon={<FiPhone />}
                                variant="ghost"
                                size="sm"
                              />
                              <Menu>
                                <MenuButton
                                  as={IconButton}
                                  aria-label="More options"
                                  icon={<FiMoreVertical />}
                                  variant="ghost"
                                  size="sm"
                                />
                                <MenuList>
                                  <MenuItem
                                    as={NextLink}
                                    href={`/dashboard/clients/${client._id}`}
                                  >
                                    Details anzeigen
                                  </MenuItem>
                                  <MenuItem
                                    as={NextLink}
                                    href={`/dashboard/payments/new?client=${client._id}`}
                                  >
                                    Neue Zahlung
                                  </MenuItem>
                                </MenuList>
                              </Menu>
                            </HStack>
                          </Flex>
                        </Box>
                      ))}
                  </VStack>
                </VStack>
              </Box>
            </VStack>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
