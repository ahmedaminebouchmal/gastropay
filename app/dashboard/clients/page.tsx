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
import { useState, useEffect } from 'react';
import { Client } from '@/types';

export default function ClientsPage() {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const toast = useToast();
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    onOpen();
  };

  const handleDeleteClient = async (client: Client) => {
    if (!window.confirm('Möchten Sie diesen Kunden wirklich löschen?')) {
      return;
    }

    try {
      const response = await fetch(`/api/clients?id=${client._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Löschen des Kunden');
      }

      toast({
        title: 'Erfolg',
        description: 'Kunde wurde erfolgreich gelöscht',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Refresh the clients list
      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: 'Fehler',
        description: error.message || 'Fehler beim Löschen des Kunden',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleViewInvoices = (client: Client) => {
    setSelectedClient(client);
    setViewMode('details');
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Kunden');
      }
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreateClient = async (data: any) => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Erstellen des Kunden');
      }

      const newClient = await response.json();
      setClients(prev => [newClient, ...prev]);
      onClose();
    } catch (error) {
      console.error('Error creating client:', error);
      throw error; // Re-throw to let the form handle the error
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedClient(null);
  };

  const handleRateClient = (client: Client) => {
    // TODO: Implement rating functionality
    console.log('Rate client:', client);
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
