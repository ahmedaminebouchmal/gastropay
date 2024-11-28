import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  useColorModeValue,
  Badge,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  SimpleGrid,
  Icon,
  Button,
} from '@chakra-ui/react';
import { FiMail, FiPhone, FiMapPin, FiHome, FiFileText } from 'react-icons/fi';
import { TransactionsTable } from '../../dashboard/Tables/TransactionsTable';
import { Client } from '@/types';

interface Transaction {
  id: number;
  user: string;
  amount: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
}

interface ClientDetailsProps {
  client: Client;
  transactions: Transaction[];
}

export function ClientDetails({ client, transactions }: ClientDetailsProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const iconColor = useColorModeValue('purple.500', 'purple.300');

  const InfoItem = ({ icon, label, value }: { icon: any; label: string; value: string }) => (
    <HStack spacing={4}>
      <Icon as={icon} w={5} h={5} color={iconColor} />
      <VStack align="start" spacing={0}>
        <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
          {label}
        </Text>
        <Text fontWeight="medium">{value}</Text>
      </VStack>
    </HStack>
  );

  return (
    <Box
      bg={bgColor}
      borderRadius="xl"
      boxShadow="xl"
      border="1px"
      borderColor={borderColor}
      overflow="hidden"
    >
      {/* Header */}
      <Box p={6} borderBottom="1px" borderColor={borderColor}>
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={2}>
            <Heading size="lg">{client.fullName}</Heading>
            {client.company && (
              <Badge colorScheme="purple" fontSize="sm">
                {client.company}
              </Badge>
            )}
          </VStack>
          <Button colorScheme="purple" size="sm">
            Neue Zahlung
          </Button>
        </HStack>
      </Box>

      {/* Content */}
      <Tabs>
        <TabList px={6} borderBottom="1px" borderColor={borderColor}>
          <Tab>Übersicht</Tab>
          <Tab>Transaktionen</Tab>
          <Tab>Dokumente</Tab>
        </TabList>

        <TabPanels>
          {/* Overview Panel */}
          <TabPanel p={6}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              <VStack align="start" spacing={6}>
                <Heading size="sm" mb={2}>
                  Kontaktinformationen
                </Heading>
                <HStack>
                  <Icon as={FiMail} color="gray.500" />
                  <Text>{client.email}</Text>
                </HStack>
                <HStack>
                  <Icon as={FiPhone} color="gray.500" />
                  <Text>{client.phoneNumber}</Text>
                </HStack>
                <HStack>
                  <Icon as={FiMapPin} color="gray.500" />
                  <Text>{client.address}</Text>
                </HStack>
              </VStack>

              <VStack align="start" spacing={6}>
                <Heading size="sm" mb={2}>
                  Unternehmensinformationen
                </Heading>
                {client.company && (
                  <HStack>
                    <Icon as={FiHome} color="gray.500" />
                    <Text>{client.company}</Text>
                  </HStack>
                )}
              </VStack>
            </SimpleGrid>
          </TabPanel>

          {/* Transactions Panel */}
          <TabPanel p={6}>
            <TransactionsTable transactions={transactions} />
          </TabPanel>

          {/* Documents Panel */}
          <TabPanel p={6}>
            <VStack align="start" spacing={4}>
              <Heading size="sm">Dokumente</Heading>
              <Text color={useColorModeValue('gray.600', 'gray.400')}>
                Keine Dokumente vorhanden
              </Text>
              <Button leftIcon={<FiFileText />} variant="outline" size="sm">
                Dokument hochladen
              </Button>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
