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
import { useMemo } from 'react';
import { FiMail, FiPhone, FiMapPin, FiHome, FiFileText } from 'react-icons/fi';
import { TransactionsTable } from '../../dashboard/Tables/TransactionsTable';
import { Client } from '@/types';
import { PaymentStatus } from '@/types/payment';

interface Transaction {
  id: string;
  client: string;
  amount: string;
  status: PaymentStatus;
  date: string;
}

interface ClientDetailsProps {
  client: Client;
  transactions?: Transaction[];
}

const InfoItem = ({ icon, label, value, iconColor }: { 
  icon: any; 
  label: string; 
  value: string | number;
  iconColor: string;
}) => (
  <HStack spacing={2}>
    <Icon as={icon} w={4} h={4} color={iconColor} />
    <Text fontWeight="medium">{label}:</Text>
    <Text>{value}</Text>
  </HStack>
);

export function ClientDetails({ client, transactions = [] }: ClientDetailsProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const iconColor = useColorModeValue('purple.500', 'purple.300');

  const clientInfoItems = useMemo(() => [
    { icon: FiMail, label: "Email", value: client.email },
    { icon: FiPhone, label: "Telefon", value: client.phoneNumber },
    { icon: FiMapPin, label: "Adresse", value: client.address }
  ], [client.email, client.phoneNumber, client.address]);

  const renderClientInfo = () => (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
      {clientInfoItems.map((item, index) => (
        <InfoItem
          key={index}
          icon={item.icon}
          label={item.label}
          value={item.value}
          iconColor={iconColor}
        />
      ))}
    </SimpleGrid>
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
            {renderClientInfo()}
            <VStack align="start" spacing={6} mt={6}>
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
          </TabPanel>

          {/* Transactions Panel */}
          <TabPanel p={6}>
            {transactions.length > 0 ? (
              <TransactionsTable transactions={transactions} />
            ) : (
              <Box py={4} textAlign="center">
                <Text color="gray.500">Keine Transaktionen gefunden</Text>
              </Box>
            )}
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
