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
  Divider,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  InputRightElement,
  Heading,
  SimpleGrid,
  Icon,
  Badge,
} from '@chakra-ui/react';
import { QRCode } from '../QRCode/QRCode';
import { FiDownload, FiRefreshCw, FiCopy } from 'react-icons/fi';

interface PaymentData {
  amount: number;
  currency: string;
  description: string;
  reference: string;
  recipientName?: string;
  recipientIBAN?: string;
  dueDate?: string;
}

export function PaymentGenerator() {
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: 0,
    currency: 'EUR',
    description: '',
    reference: generateReference(),
    recipientName: '',
    recipientIBAN: '',
    dueDate: new Date().toISOString().split('T')[0],
  });
  const [qrCodeData, setQRCodeData] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  function generateReference(): string {
    const date = new Date();
    const prefix = 'GP';
    const timestamp = date.getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

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

    setIsGeneratingPDF(true);
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

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Gastropay_Zahlung_${paymentData.reference || 'QR'}.pdf`;
      link.click();
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
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleCopyReference = () => {
    navigator.clipboard.writeText(paymentData.reference);
    toast({
      title: 'Referenz kopiert',
      description: 'Die Referenznummer wurde in die Zwischenablage kopiert.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleRefreshReference = () => {
    setPaymentData(prev => ({
      ...prev,
      reference: generateReference(),
    }));
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
      <VStack spacing={8}>
        <Heading size="md" alignSelf="flex-start">Zahlung erstellen</Heading>
        
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
          {/* Left Column - Payment Details */}
          <Box>
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel>Betrag</FormLabel>
                <InputGroup>
                  <NumberInput
                    min={0}
                    precision={2}
                    value={paymentData.amount}
                    onChange={(_, value) => setPaymentData({ ...paymentData, amount: value })}
                    w="full"
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <InputRightAddon>{paymentData.currency}</InputRightAddon>
                </InputGroup>
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
                  placeholder="Zahlungsbeschreibung eingeben..."
                />
              </FormControl>
            </VStack>
          </Box>

          {/* Middle Column - Recipient Details */}
          <Box>
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel>Empfänger Name</FormLabel>
                <Input
                  value={paymentData.recipientName}
                  onChange={(e) => setPaymentData({ ...paymentData, recipientName: e.target.value })}
                  placeholder="Name des Empfängers..."
                />
              </FormControl>

              <FormControl>
                <FormLabel>Empfänger IBAN</FormLabel>
                <Input
                  value={paymentData.recipientIBAN}
                  onChange={(e) => setPaymentData({ ...paymentData, recipientIBAN: e.target.value })}
                  placeholder="DE89 3704 0044 0532 0130 00"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Fälligkeitsdatum</FormLabel>
                <Input
                  type="date"
                  value={paymentData.dueDate}
                  onChange={(e) => setPaymentData({ ...paymentData, dueDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Referenz</FormLabel>
                <InputGroup>
                  <Input
                    value={paymentData.reference}
                    isReadOnly
                  />
                  <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={handleRefreshReference}>
                      <Icon as={FiRefreshCw} />
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            </VStack>
          </Box>

          {/* Right Column - QR Code and Actions */}
          <Box>
            <VStack spacing={6} align="center">
              {qrCodeData ? (
                <>
                  <QRCode value={qrCodeData} size={200} />
                  <Button
                    leftIcon={<FiDownload />}
                    colorScheme="purple"
                    onClick={handleDownloadPDF}
                    isLoading={isGeneratingPDF}
                    w="full"
                  >
                    PDF herunterladen
                  </Button>
                </>
              ) : (
                <Text color="gray.500" textAlign="center">
                  QR-Code wird nach Generierung hier angezeigt
                </Text>
              )}
              
              <Button
                colorScheme="purple"
                onClick={handleGeneratePayment}
                isLoading={isLoading}
                w="full"
              >
                Zahlung generieren
              </Button>
            </VStack>
          </Box>
        </SimpleGrid>
      </VStack>
    </Box>
  );
}
