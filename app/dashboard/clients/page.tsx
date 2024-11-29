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
import { FiPlus, FiSearch, FiFilter, FiArrowLeft } from 'react-icons/fi';
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
  const [selectedViewClient, setSelectedViewClient] = useState<Client | null>(null);

  const handleViewClient = (client: Client) => {
    setSelectedViewClient(client);
    setViewMode('details');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedViewClient(null);
  };

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
        throw new Error('Failed to delete client');
      }

      // Remove client from state
      setClients(clients.filter(c => c._id !== client._id));

      toast({
        title: 'Kunde gelöscht',
        description: 'Der Kunde wurde erfolgreich gelöscht.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: 'Fehler',
        description: 'Der Kunde konnte nicht gelöscht werden.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
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

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Flex align="center" wrap="wrap" gap={4}>
            {viewMode === 'details' ? (
              <>
                <HStack>
                  <Button
                    variant="ghost"
                    onClick={handleBackToList}
                    leftIcon={<FiArrowLeft />}
                  >
                    Zurück
                  </Button>
                  <Heading size="lg">Kundendetails</Heading>
                </HStack>
              </>
            ) : (
              <>
                <Heading size="lg">Kunden</Heading>
                <Spacer />
                <HStack spacing={4}>
                  <InputGroup maxW="300px">
                    <InputLeftElement pointerEvents="none">
                      <FiSearch color="gray.300" />
                    </InputLeftElement>
                    <Input
                      placeholder="Suchen..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </InputGroup>
                  <Button
                    leftIcon={<FiFilter />}
                    variant="outline"
                    colorScheme="purple"
                  >
                    Filter
                  </Button>
                  <Button
                    leftIcon={<FiPlus />}
                    colorScheme="purple"
                    onClick={() => {
                      setSelectedClient(null);
                      onOpen();
                    }}
                  >
                    Neuer Kunde
                  </Button>
                </HStack>
              </>
            )}
          </Flex>

          {/* Content */}
          {viewMode === 'details' && selectedViewClient ? (
            <Box
              bg={cardBg}
              p={6}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <ClientDetails client={selectedViewClient} />
            </Box>
          ) : (
            <ClientList
              clients={clients.filter(client =>
                client.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (client.company && client.company.toLowerCase().includes(searchQuery.toLowerCase()))
              )}
              onView={handleViewClient}
              onEdit={handleEditClient}
              onDelete={handleDeleteClient}
            />
          )}
        </VStack>
      </Container>

      {/* Client Form Modal */}
      <ClientForm
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={async (data) => {
          try {
            const res = selectedClient
              ? await fetch(`/api/clients/${selectedClient._id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data),
                })
              : await fetch('/api/clients', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data),
                });

            if (!res.ok) throw new Error('Failed to save client');
            
            const updatedClient = await res.json();
            
            if (selectedClient) {
              // Update existing client in state
              setClients(clients.map(c =>
                c._id === updatedClient._id ? updatedClient : c
              ));
            } else {
              // Add new client to state
              setClients([...clients, updatedClient]);
            }
            
            onClose();
            toast({
              title: selectedClient ? 'Client updated' : 'Client created',
              status: 'success',
              duration: 3000,
            });
          } catch (error) {
            console.error('Error saving client:', error);
            toast({
              title: 'Error saving client',
              status: 'error',
              duration: 3000,
            });
          }
        }}
      />
    </Box>
  );
}
