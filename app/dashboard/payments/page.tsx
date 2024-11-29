'use client';

import {
  Box,
  Container,
  Heading,
  Button,
  HStack,
  useColorModeValue,
  VStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Badge,
  Flex,
  Spacer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { FiPlus, FiFilter, FiMoreVertical, FiDownload, FiEye, FiTrash2 } from 'react-icons/fi';
import { PaymentGenerator } from '@/components/payments/Generator/PaymentGenerator';
import { useState, useEffect } from 'react';
import { Payment, PaymentStatus } from '@/types';

export default function PaymentsPage() {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const toast = useToast();

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/payments');
      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch payments',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return 'green';
      case PaymentStatus.PENDING:
        return 'yellow';
      case PaymentStatus.CONFIRMED:
        return 'blue';
      case PaymentStatus.DECLINED:
        return 'red';
      default:
        return 'gray';
    }
  };

  const handleViewPayment = async (payment: Payment) => {
    try {
      const qrCodeData = JSON.stringify({
        paymentId: payment._id,
        amount: payment.amount,
        currency: payment.currency,
        reference: payment.reference
      });

      const response = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentData: {
            ...payment,
            amount: Number(payment.amount), // Ensure amount is a number
            clientId: typeof payment.clientId === 'object' ? payment.clientId : { fullName: 'Nicht angegeben' }
          },
          qrCodeData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to generate PDF');
      }

      // Create a blob from the PDF stream
      const blob = await response.blob();
      // Create a link to download the PDF
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payment-${payment.reference || 'unknown'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'PDF generated and downloaded successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate PDF',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeletePayment = async (payment: Payment) => {
    if (!confirm('Are you sure you want to delete this payment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/payments?id=${payment._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete payment');
      }

      toast({
        title: 'Success',
        description: 'Payment deleted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Refresh the payments list
      fetchPayments();
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete payment',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box minH="100vh" bg={bgColor} pt={8} pb={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {/* Header with navigation */}
          <Flex align="center" wrap="wrap" gap={4}>
            <Heading size="lg">Zahlungen</Heading>
            <Spacer />
            <HStack spacing={4}>
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
                onClick={onOpen}
              >
                Neue Zahlung
              </Button>
            </HStack>
          </Flex>

          {/* Payment List */}
          <Box
            bg={cardBg}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
            overflow="hidden"
          >
            <Tabs colorScheme="purple">
              <TabList px={4}>
                <Tab>Alle</Tab>
                <Tab>Ausstehend</Tab>
                <Tab>Bezahlt</Tab>
                <Tab>Bestätigt</Tab>
                <Tab>Abgelehnt</Tab>
              </TabList>

              <TabPanels>
                <TabPanel p={0}>
                  <Box overflowX="auto">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid', borderColor: borderColor }}>Referenz</th>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid', borderColor: borderColor }}>Kunde</th>
                          <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid', borderColor: borderColor }}>Betrag</th>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid', borderColor: borderColor }}>Status</th>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid', borderColor: borderColor }}>Fällig am</th>
                          <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid', borderColor: borderColor }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={6} style={{ padding: '24px', textAlign: 'center' }}>
                              <Text color="gray.500">Lade Zahlungen...</Text>
                            </td>
                          </tr>
                        ) : payments.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ padding: '24px', textAlign: 'center' }}>
                              <Text color="gray.500">Keine Zahlungen vorhanden</Text>
                            </td>
                          </tr>
                        ) : (
                          payments.map((payment) => (
                            <tr key={payment._id.toString()}>
                              <td style={{ padding: '12px', borderBottom: '1px solid', borderColor: borderColor }}>
                                {payment.reference}
                              </td>
                              <td style={{ padding: '12px', borderBottom: '1px solid', borderColor: borderColor }}>
                                {payment.clientId?.fullName || 'N/A'}
                              </td>
                              <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid', borderColor: borderColor }}>
                                {payment.amount.toFixed(2)} €
                              </td>
                              <td style={{ padding: '12px', borderBottom: '1px solid', borderColor: borderColor }}>
                                <Badge colorScheme={getStatusColor(payment.status)}>
                                  {payment.status}
                                </Badge>
                              </td>
                              <td style={{ padding: '12px', borderBottom: '1px solid', borderColor: borderColor }}>
                                {new Date(payment.dueDate).toLocaleDateString('de-DE')}
                              </td>
                              <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid', borderColor: borderColor }}>
                                <Menu>
                                  <MenuButton
                                    as={IconButton}
                                    icon={<FiMoreVertical />}
                                    variant="ghost"
                                    size="sm"
                                  />
                                  <MenuList>
                                    <MenuItem
                                      icon={<FiEye />}
                                      onClick={() => handleViewPayment(payment)}
                                    >
                                      PDF anzeigen
                                    </MenuItem>
                                    <MenuItem
                                      icon={<FiDownload />}
                                      onClick={() => handleViewPayment(payment)}
                                    >
                                      PDF herunterladen
                                    </MenuItem>
                                    <MenuItem
                                      icon={<FiTrash2 />}
                                      onClick={() => handleDeletePayment(payment)}
                                      color="red.500"
                                    >
                                      Löschen
                                    </MenuItem>
                                  </MenuList>
                                </Menu>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </Box>
                </TabPanel>
                <TabPanel>
                  <Text p={4} color="gray.500">Ausstehende Zahlungen werden hier angezeigt</Text>
                </TabPanel>
                <TabPanel>
                  <Text p={4} color="gray.500">Bezahlte Zahlungen werden hier angezeigt</Text>
                </TabPanel>
                <TabPanel>
                  <Text p={4} color="gray.500">Bestätigte Zahlungen werden hier angezeigt</Text>
                </TabPanel>
                <TabPanel>
                  <Text p={4} color="gray.500">Abgelehnte Zahlungen werden hier angezeigt</Text>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </VStack>
      </Container>

      {/* Payment Form Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent maxWidth="1400px">
          <ModalHeader>Neue Zahlung erstellen</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <PaymentGenerator />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
