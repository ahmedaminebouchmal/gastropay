'use client';

import {
  Box,
  Container,
  Heading,
  Button,
  HStack,
  useColorModeValue,
  VStack,
  useDisclosure,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  InputGroup,
  Input,
  InputLeftElement,
  Flex,
  Spacer,
  useToast,
} from '@chakra-ui/react';
import { FiPlus, FiSearch, FiFilter } from 'react-icons/fi';
import { ClientList } from '@/components/clients/List/ClientList';
import { ClientForm } from '@/components/clients/Forms/ClientForm';
import { ClientDetails } from '@/components/clients/Details/ClientDetails';
import { useState } from 'react';
import { Client } from '@/types';

export default function ClientsPage() {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState<Client[]>([]); // Will be populated with real data
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    onOpen();
  };

  const handleDeleteClient = async (client: Client) => {
    // TODO: Implement delete functionality
    console.log('Delete client:', client);
  };

  const handleViewInvoices = (client: Client) => {
    setSelectedClient(client);
    setViewMode('details');
  };

  const handleCreateClient = async (data: any) => {
    try {
      // TODO: Implement API call to save client
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      // After successful creation, you would typically:
      // 1. Add the new client to the clients list
      // 2. Show a success message (handled in the form)
      // 3. Close the modal (handled in the form)
    } catch (error) {
      throw error; // Let the form handle the error
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedClient(null);
  };

  const handleRateClient = (client: Client) => {
    // TODO: Implement rating functionality
    toast({
      title: 'Bewertung',
      description: 'Bewertungsfunktion wird in Kürze verfügbar sein.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box minH="100vh" bg={bgColor} pt={8} pb={8}>
      <Container maxW="container.xl">
        {viewMode === 'list' ? (
          <VStack spacing={8} align="stretch">
            <Flex align="center" wrap="wrap" gap={4}>
              <Heading size="lg">Kunden</Heading>
              <Spacer />
              <HStack spacing={4}>
                <InputGroup maxW="300px">
                  <InputLeftElement pointerEvents="none">
                    <FiSearch color="gray.300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Kunden suchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    bg={cardBg}
                    borderRadius="lg"
                  />
                </InputGroup>
                <Button
                  leftIcon={<FiFilter />}
                  variant="outline"
                  colorScheme="purple"
                  size="md"
                  borderRadius="lg"
                  fontWeight="medium"
                  px={4}
                >
                  Filter
                </Button>
                <Button
                  leftIcon={<FiPlus />}
                  colorScheme="purple"
                  size="md"
                  onClick={onOpen}
                  borderRadius="lg"
                  fontWeight="medium"
                  px={6}
                  _hover={{
                    transform: 'translateY(-1px)',
                    boxShadow: 'lg',
                  }}
                  _active={{
                    transform: 'translateY(0)',
                  }}
                  transition="all 0.2s"
                >
                  Neuer Kunde
                </Button>
              </HStack>
            </Flex>

            <Box
              bg={cardBg}
              borderRadius="xl"
              borderWidth="1px"
              borderColor={borderColor}
              overflow="hidden"
            >
              <Tabs colorScheme="purple">
                <TabList px={4}>
                  <Tab>Alle Kunden</Tab>
                  <Tab>Aktiv</Tab>
                  <Tab>Inaktiv</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel p={0}>
                    <ClientList
                      clients={clients}
                      onEdit={handleEditClient}
                      onDelete={handleDeleteClient}
                      onViewInvoices={handleViewInvoices}
                      onRate={handleRateClient}
                    />
                  </TabPanel>
                  <TabPanel>
                    <Text p={4} color="gray.500">Aktive Kunden werden hier angezeigt</Text>
                  </TabPanel>
                  <TabPanel>
                    <Text p={4} color="gray.500">Inaktive Kunden werden hier angezeigt</Text>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          </VStack>
        ) : (
          <VStack spacing={8} align="stretch">
            <HStack>
              <Button
                variant="ghost"
                onClick={handleBackToList}
              >
                ← Zurück zur Übersicht
              </Button>
            </HStack>
            {selectedClient && (
              <ClientDetails
                client={selectedClient}
                transactions={[]} // Will be populated with real data
              />
            )}
          </VStack>
        )}

        {/* Client Form Modal */}
        <ClientForm
          isOpen={isOpen}
          onClose={onClose}
          onSubmit={handleCreateClient}
        />
      </Container>
    </Box>
  );
}
