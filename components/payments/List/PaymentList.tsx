import {
  Box,
  useColorModeValue,
  HStack,
  IconButton,
  Tooltip,
  Flex,
  VStack,
  Text,
  Badge,
  Icon,
  Button,
  Spacer,
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2, FiEye, FiDownload, FiCreditCard, FiArrowLeft, FiExternalLink } from 'react-icons/fi';
import { Payment, PaymentStatus } from '@/types/payment';
import { Client } from '@/types/client';
import { PaymentDetails } from '../Details/PaymentDetails';
import { useState, useMemo } from 'react';

interface PaymentListProps {
  payments: Payment[];
  onEdit?: (payment: Payment) => void;
  onDelete?: (payment: Payment) => void;
  onDownload?: (payment: Payment) => void;
  onStripeCheckout?: (payment: Payment) => void;
}

const formatDate = (date: Date | string) => {
  if (!date) return '';
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatAmount = (amount: number, currency: string) => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

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

function PaymentCard({ payment }: { payment: Payment }) {
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const iconColor = useColorModeValue('purple.500', 'purple.300');

  const formattedDate = useMemo(() => {
    if (!payment?.dueDate) return '';
    return formatDate(payment.dueDate);
  }, [payment?.dueDate]);

  const clientInfo = useMemo(() => {
    if (!payment?.clientId || typeof payment.clientId !== 'object') {
      return null;
    }

    const client = payment.clientId as any;
    if (!client || typeof client !== 'object') {
      return null;
    }

    return typeof client.fullName === 'string' ? {
      name: client.fullName,
      company: client.company || undefined
    } : null;
  }, [payment?.clientId]);

  return (
    <VStack align="start" spacing={2} w="full">
      <HStack spacing={3} width="full">
        <Icon as={FiCreditCard} w={5} h={5} color={iconColor} />
        <VStack align="start" spacing={0}>
          <Text fontWeight="medium" fontSize="lg">
            {payment.reference}
          </Text>
          {clientInfo && (
            <Text fontSize="sm" color={mutedColor}>
              {clientInfo.name}
              {clientInfo.company && ` - ${clientInfo.company}`}
            </Text>
          )}
        </VStack>
        <Spacer />
        <Badge colorScheme={getStatusColor(payment.status)}>
          {payment.status}
        </Badge>
      </HStack>

      <HStack spacing={6} color={mutedColor}>
        <Text fontSize="md" fontWeight="medium">
          {formatAmount(payment.amount, payment.currency)}
        </Text>
        {payment.dueDate && (
          <Text fontSize="sm">
            Fällig am: {formattedDate}
          </Text>
        )}
      </HStack>

      {payment.description && (
        <Text fontSize="sm" color={mutedColor} noOfLines={2}>
          {payment.description}
        </Text>
      )}
    </VStack>
  );
}

export function PaymentList({ payments, onEdit, onDelete, onDownload, onStripeCheckout }: PaymentListProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const handleDelete = async (payment: Payment) => {
    try {
      const response = await fetch(`/api/payments/${payment._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete payment');
      }

      onDelete?.(payment);
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  if (!payments || payments.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500">Keine Zahlungen vorhanden</Text>
      </Box>
    );
  }

  if (selectedPayment) {
    return (
      <VStack spacing={4} align="stretch">
        <HStack>
          <Button
            leftIcon={<FiArrowLeft />}
            variant="ghost"
            onClick={() => setSelectedPayment(null)}
          >
            Zurück zur Liste
          </Button>
        </HStack>

        <PaymentDetails
          payment={selectedPayment}
          onGeneratePDF={() => onDownload?.(selectedPayment)}
          onOpenStripeCheckout={() => onStripeCheckout?.(selectedPayment)}
        />
      </VStack>
    );
  }

  const paymentCards = useMemo(() => 
    payments.map((payment) => (
      <Box
        key={payment._id.toString()}
        p={4}
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        transition="all 0.2s"
        _hover={{
          bg: hoverBg,
          transform: 'translateY(-2px)',
          boxShadow: 'sm',
        }}
      >
        <Flex justify="space-between" align="center" gap={4}>
          <Box flex="1">
            <PaymentCard payment={payment} />
          </Box>

          <HStack spacing={2}>
            <Tooltip label="Details anzeigen">
              <IconButton
                aria-label="Zahlung anzeigen"
                icon={<FiEye />}
                variant="ghost"
                colorScheme="purple"
                size="sm"
                onClick={() => setSelectedPayment(payment)}
              />
            </Tooltip>
            
            {onEdit && (
              <Tooltip label="Bearbeiten">
                <IconButton
                  aria-label="Zahlung bearbeiten"
                  icon={<FiEdit2 />}
                  variant="ghost"
                  colorScheme="purple"
                  size="sm"
                  onClick={() => onEdit(payment)}
                />
              </Tooltip>
            )}

            {onDownload && (
              <Tooltip label="PDF herunterladen">
                <IconButton
                  aria-label="PDF herunterladen"
                  icon={<FiDownload />}
                  variant="ghost"
                  colorScheme="purple"
                  size="sm"
                  onClick={() => onDownload(payment)}
                />
              </Tooltip>
            )}
            
            {onDelete && (
              <Tooltip label="Löschen">
                <IconButton
                  aria-label="Zahlung löschen"
                  icon={<FiTrash2 />}
                  variant="ghost"
                  colorScheme="red"
                  size="sm"
                  onClick={() => handleDelete(payment)}
                />
              </Tooltip>
            )}
          </HStack>
        </Flex>
      </Box>
    )),
    [payments, bgColor, borderColor, hoverBg, onEdit, onDelete, onDownload]
  );

  return (
    <VStack spacing={4} align="stretch" w="full">
      {paymentCards}
    </VStack>
  );
}
