import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  useColorModeValue,
  Badge,
  SimpleGrid,
  Icon,
  Button,
  Divider,
} from '@chakra-ui/react';
import { FiCreditCard, FiCalendar, FiUser, FiFileText, FiDownload, FiExternalLink } from 'react-icons/fi';
import { Payment, PaymentStatus } from '@/types/payment';
import { useMemo } from 'react';

interface PaymentDetailsProps {
  payment: Payment;
  onGeneratePDF?: () => void;
  onOpenStripeCheckout?: () => void;
}

export function PaymentDetails({ payment, onGeneratePDF, onOpenStripeCheckout }: PaymentDetailsProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const iconColor = useColorModeValue('purple.500', 'purple.300');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  const InfoItem = ({ icon, label, value }: { icon: any; label: string; value: string | number }) => (
    <HStack spacing={4}>
      <Icon as={icon} w={5} h={5} color={iconColor} />
      <VStack align="start" spacing={0}>
        <Text fontSize="sm" color={mutedColor}>
          {label}
        </Text>
        <Text fontWeight="medium">{value}</Text>
      </VStack>
    </HStack>
  );

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

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formattedDate = useMemo(() => {
    return payment.dueDate ? formatDate(payment.dueDate) : '';
  }, [payment.dueDate]);

  if (!payment) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500">Keine Zahlungsdetails verfügbar</Text>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
      <VStack spacing={6} align="stretch">
        {/* Payment Header */}
        <VStack align="start" spacing={4}>
          <HStack spacing={3}>
            <Heading size="md">Zahlung {payment.reference}</Heading>
            <Badge colorScheme={getStatusColor(payment.status)} fontSize="sm">
              {payment.status}
            </Badge>
          </HStack>

          {/* Amount and Due Date */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="full">
            <InfoItem
              icon={FiCreditCard}
              label="Betrag"
              value={formatAmount(payment.amount, payment.currency)}
            />
            {payment.dueDate && (
              <InfoItem
                icon={FiCalendar}
                label="Fälligkeitsdatum"
                value={formattedDate}
              />
            )}
          </SimpleGrid>

          {/* Description */}
          {payment.description && (
            <Box>
              <Text fontSize="sm" color={mutedColor} mb={1}>
                Beschreibung
              </Text>
              <Text>{payment.description}</Text>
            </Box>
          )}
        </VStack>

        <Divider />

        {/* Client Information */}
        {payment.clientId && typeof payment.clientId === 'object' && '_id' in payment.clientId && (
          <VStack align="start" spacing={4}>
            <Heading size="sm">Kundeninformationen</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="full">
              <InfoItem
                icon={FiUser}
                label="Name"
                value={payment.clientId.fullName}
              />
              {payment.clientId.company && (
                <InfoItem
                  icon={FiFileText}
                  label="Unternehmen"
                  value={payment.clientId.company}
                />
              )}
            </SimpleGrid>
          </VStack>
        )}

        {/* Actions */}
        <HStack spacing={4} pt={4}>
          {onGeneratePDF && (
            <Button
              leftIcon={<FiDownload />}
              colorScheme="purple"
              variant="outline"
              onClick={onGeneratePDF}
              aria-label="PDF herunterladen"
            >
              PDF herunterladen
            </Button>
          )}
          {onOpenStripeCheckout && (
            <Button
              leftIcon={<FiExternalLink />}
              colorScheme="purple"
              onClick={onOpenStripeCheckout}
              aria-label="Zur Zahlung"
            >
              Zur Zahlung
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  );
}