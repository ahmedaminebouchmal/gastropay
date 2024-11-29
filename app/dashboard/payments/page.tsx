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

  const handleOpenModal = (payment?: Payment) => {
    setSelectedPayment(payment || null);
    onOpen();
  };

  const handleCloseModal = () => {
    setSelectedPayment(null);
    onClose();
  };

  const handleEditPayment = (payment: Payment) => {
    handleOpenModal(payment);
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
                onClick={() => handleOpenModal()}
              >
                Neue Zahlung
              </Button>
            </HStack>
          </Flex>

          {/* Payment list */}
          {loading ? (
            <Text>Loading...</Text>
          ) : (
            <VStack spacing={4} align="stretch">
              {payments.map((payment) => (
                <Box
                  key={payment._id.toString()}
                  p={4}
                  bg={cardBg}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor={borderColor}
                  boxShadow="sm"
                  _hover={{ boxShadow: 'md' }}
                  transition="all 0.2s"
                >
                  <Flex align="center" gap={4}>
                    {/* Payment Info */}
                    <VStack align="start" flex={1} spacing={2}>
                      <HStack spacing={3}>
                        <Text fontWeight="bold">{payment.reference}</Text>
                        <Badge
                          colorScheme={
                            payment.status === PaymentStatus.PAID
                              ? 'green'
                              : payment.status === PaymentStatus.PENDING
                              ? 'yellow'
                              : 'red'
                          }
                        >
                          {payment.status}
                        </Badge>
                      </HStack>
                      
                      {/* Client Info */}
                      {payment.clientId && typeof payment.clientId === 'object' && '_id' in payment.clientId && (
                        <VStack align="start" spacing={1}>
                          <HStack spacing={2}>
                            <Text 
                              fontSize="sm" 
                              fontWeight="medium" 
                              color={useColorModeValue('gray.700', 'gray.200')}
                            >
                              {payment.clientId.fullName}
                            </Text>
                            {payment.clientId.company && (
                              <>
                                <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>•</Text>
                                <Text 
                                  fontSize="sm" 
                                  fontWeight="medium"
                                  color={useColorModeValue('gray.700', 'gray.200')}
                                >
                                  {payment.clientId.company}
                                </Text>
                              </>
                            )}
                          </HStack>
                          {payment.clientId.address && (
                            <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
                              {payment.clientId.address}
                            </Text>
                          )}
                          {payment.clientId.email && (
                            <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
                              {payment.clientId.email}
                            </Text>
                          )}
                        </VStack>
                      )}
                      
                      {/* Payment Amount */}
                      <Text fontSize="sm" fontWeight="medium">
                        {new Intl.NumberFormat('de-DE', {
                          style: 'currency',
                          currency: payment.currency || 'EUR'
                        }).format(Number(payment.amount))}
                      </Text>
                    </VStack>

                    {/* Actions */}
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="View payment"
                        icon={<FiEye />}
                        size="sm"
                        variant="ghost"
                        colorScheme="purple"
                        onClick={() => handleGeneratePDF(payment)}
                      />
                      <IconButton
                        aria-label="Edit payment"
                        icon={<FiEdit2 />}
                        size="sm"
                        variant="ghost"
                        colorScheme="purple"
                        onClick={() => handleEditPayment(payment)}
                      />
                      <IconButton
                        aria-label="Delete payment"
                        icon={<FiTrash2 />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleDeleteClick(payment)}
                      />
                    </HStack>
                  </Flex>
                </Box>
              ))}
            </VStack>
          )}
        </VStack>
      </Container>

      {/* Payment Generator Modal */}
      <Modal isOpen={isOpen} onClose={handleCloseModal} size="xl">
        <ModalOverlay />
        <ModalContent maxW="800px">
          <ModalHeader>{selectedPayment ? 'Zahlung bearbeiten' : 'Neue Zahlung'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <PaymentGenerator 
              onClose={handleCloseModal}
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
