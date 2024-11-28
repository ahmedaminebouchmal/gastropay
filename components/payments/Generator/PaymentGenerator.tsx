import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Select,
  HStack,
  useColorModeValue,
  Text,
} from '@chakra-ui/react';
import { QRCode } from '../QRCode/QRCode';

interface PaymentData {
  amount: number;
  currency: string;
  description: string;
  reference: string;
}

export function PaymentGenerator() {
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: 0,
    currency: 'EUR',
    description: '',
    reference: '',
  });
  const [qrCodeData, setQRCodeData] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleGeneratePayment = async () => {
    setIsLoading(true);
    try {
      // Generate payment data string for QR code
      const paymentString = JSON.stringify({
        ...paymentData,
        timestamp: new Date().toISOString(),
      });
      
      setQRCodeData(paymentString);
      
      toast({
        title: 'Zahlung generiert',
        description: 'QR-Code wurde erfolgreich erstellt.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Zahlung konnte nicht generiert werden.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!qrCodeData) {
      toast({
        title: 'Fehler',
        description: 'Bitte zuerst eine Zahlung generieren.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentData,
          qrCodeData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a URL for the blob
      const url = URL.createObjectURL(blob);

      // Create a link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `Gastropay_Zahlung_${paymentData.reference || 'QR'}.pdf`;
      link.click();

      // Clean up
      URL.revokeObjectURL(url);
      
      toast({
        title: 'PDF erstellt',
        description: 'Die PDF wurde erfolgreich heruntergeladen.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Fehler',
        description: 'PDF konnte nicht erstellt werden.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="xl"
      boxShadow="xl"
      border="1px"
      borderColor={borderColor}
    >
      <VStack spacing={6}>
        <FormControl>
          <FormLabel>Betrag</FormLabel>
          <NumberInput
            min={0}
            precision={2}
            value={paymentData.amount}
            onChange={(_, value) => setPaymentData({ ...paymentData, amount: value })}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl>
          <FormLabel>Währung</FormLabel>
          <Select
            value={paymentData.currency}
            onChange={(e) => setPaymentData({ ...paymentData, currency: e.target.value })}
          >
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>Beschreibung</FormLabel>
          <Input
            value={paymentData.description}
            onChange={(e) => setPaymentData({ ...paymentData, description: e.target.value })}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Referenz</FormLabel>
          <Input
            value={paymentData.reference}
            onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
          />
        </FormControl>

        <HStack spacing={4} width="full">
          <Button
            colorScheme="purple"
            onClick={handleGeneratePayment}
            isLoading={isLoading}
            flex={1}
          >
            Zahlung generieren
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleDownloadPDF}
            isDisabled={!qrCodeData}
            flex={1}
          >
            PDF herunterladen
          </Button>
        </HStack>

        {qrCodeData && (
          <Box textAlign="center">
            <Text mb={4} fontWeight="bold">
              QR-Code für Zahlung
            </Text>
            <QRCode value={qrCodeData} />
          </Box>
        )}
      </VStack>
    </Box>
  );
}
