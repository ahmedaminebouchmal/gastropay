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
import { PaymentList } from '@/components/payments/List/PaymentList';

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
        throw new Error('Fehler beim Laden der Zahlungen');
      }
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: 'Fehler',
        description: 'Fehler beim Laden der Zahlungen',
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

  const handleGeneratePDF = async (payment: Payment) => {
    try {
      // 1. Get Stripe checkout URL
      const stripeResponse = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference: payment.reference }),
      });

      if (!stripeResponse.ok) {
        throw new Error('Fehler beim Erstellen der Zahlungssitzung');
      }

      const { url: stripeUrl } = await stripeResponse.json();

      // 2. Generate PDF with payment info and Stripe URL
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
        throw new Error('Fehler beim Generieren des PDFs');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment-${payment.reference}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Fehler',
        description: 'Fehler beim Generieren des PDFs',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeletePayment = async (payment: Payment) => {
    try {
      const response = await fetch(`/api/payments/${payment._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete payment');
      }

      // Remove the payment from the list
      setPayments(payments.filter((p) => p._id !== payment._id));
      toast({
        title: 'Zahlung gelöscht',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast({
        title: 'Fehler beim Löschen der Zahlung',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    onOpen();
  };

  const handlePaymentCreated = async () => {
    try {
      const response = await fetch('/api/payments');
      const data = await response.json();
      setPayments(data);
      onClose();
      toast({
        title: 'Zahlung aktualisiert',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: 'Fehler beim Aktualisieren der Zahlungen',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleStripeCheckout = async (payment: Payment) => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference: payment.reference }),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Erstellen der Zahlungssitzung');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Fehler',
        description: 'Fehler beim Erstellen der Zahlungssitzung',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box minH="100vh" bg={bgColor} pt={8} pb={8}>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading size="lg">Zahlungen</Heading>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="purple"
              onClick={onOpen}
            >
              Neue Zahlung
            </Button>
          </Flex>

          {loading ? (
            <Box textAlign="center" py={8}>
              <Text color="gray.500">Lade Zahlungen...</Text>
            </Box>
          ) : (
            <PaymentList
              payments={payments}
              onEdit={handleEditPayment}
              onDelete={handleDeletePayment}
              onDownload={handleGeneratePDF}
              onStripeCheckout={handleStripeCheckout}
            />
          )}
        </VStack>
      </Container>

      <Modal
        isOpen={isOpen || !!selectedPayment}
        onClose={() => {
          onClose();
          setSelectedPayment(null);
        }}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent maxW="800px">
          <ModalHeader>
            {selectedPayment ? 'Zahlung bearbeiten' : 'Neue Zahlung'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <PaymentGenerator
              onClose={() => {
                onClose();
                setSelectedPayment(null);
              }}
              onPaymentCreated={handlePaymentCreated}
              payment={selectedPayment}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
