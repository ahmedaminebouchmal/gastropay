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
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from '@chakra-ui/react';
import { FiPlus, FiFilter, FiMoreVertical, FiDownload, FiEye, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { PaymentGenerator } from '@/components/payments/Generator/PaymentGenerator';
import { useState, useEffect } from 'react';
import { Payment, PaymentStatus } from '@/types/payment';
import { Client } from '@/types/client';

export default function PaymentsPage() {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);
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

  const handleGeneratePDF = async (payment: Payment) => {
    try {
      // Create Stripe checkout session first
      const stripeResponse = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: payment.reference }),
      });

      if (!stripeResponse.ok) {
        throw new Error('Failed to create Stripe checkout session');
      }

      const { url: stripeUrl } = await stripeResponse.json();

      // Generate PDF with Stripe URL
      const response = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentData: {
            ...payment,
            amount: Number(payment.amount),
            client: payment.clientId
          },
          qrCodeData: stripeUrl,
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

  const handleDeleteClick = (payment: Payment) => {
    setPaymentToDelete(payment);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!paymentToDelete) return;

    try {
      const response = await fetch(`/api/payments/${paymentToDelete._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete payment');
      }

      toast({
        title: 'Erfolg',
        description: 'Zahlung wurde erfolgreich gelöscht',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Refresh payments list
      fetchPayments();
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast({
        title: 'Fehler',
        description: 'Zahlung konnte nicht gelöscht werden',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setPaymentToDelete(null);
    }
  };

  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    onOpen();
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

          {/* Payment list */}
          {loading ? (
            <Text>Loading...</Text>
          ) : (
            <Box>
              {payments.map((payment) => (
                <Box
                  key={payment._id.toString()}
                  p={5}
                  bg={cardBg}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor={borderColor}
                  mb={4}
                >
                  <Flex align="center" justify="space-between">
                    <VStack align="start" spacing={2}>
                      <Text fontWeight="bold">
                        Reference: {payment.reference}
                      </Text>
                      <Text>
                        Amount: {payment.amount} {payment.currency}
                      </Text>
                      <Badge colorScheme={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </VStack>
                    <HStack>
                      <IconButton
                        aria-label="Download PDF"
                        icon={<FiDownload />}
                        onClick={() => handleGeneratePDF(payment)}
                        colorScheme="purple"
                        variant="ghost"
                      />
                      <IconButton
                        aria-label="Zahlung bearbeiten"
                        icon={<FiEdit2 />}
                        onClick={() => handleEditPayment(payment)}
                        colorScheme="blue"
                        variant="ghost"
                      />
                      <IconButton
                        aria-label="Zahlung löschen"
                        icon={<FiTrash2 />}
                        onClick={() => handleDeleteClick(payment)}
                        colorScheme="red"
                        variant="ghost"
                      />
                    </HStack>
                  </Flex>
                </Box>
              ))}
            </Box>
          )}
        </VStack>
      </Container>

      {/* Payment Generator Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent maxW="800px">
          <ModalHeader>{selectedPayment ? 'Zahlung bearbeiten' : 'Neue Zahlung'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <PaymentGenerator 
              onClose={onClose}
              onPaymentCreated={fetchPayments}
              payment={selectedPayment}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={undefined}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Zahlung löschen
            </AlertDialogHeader>

            <AlertDialogBody>
              Sind Sie sicher? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={() => setIsDeleteDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                Löschen
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
