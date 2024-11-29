import { useState, useEffect } from 'react';
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
import { Client } from '@/types';
import { PaymentStatus } from '@/types';

interface PaymentData {
  amount: number;
  currency: string;
  description: string;
  reference: string;
  recipientName?: string;
  recipientIBAN?: string;
  dueDate?: string;
  clientId?: string;
  client?: Client;
}

function generateReference() {
  return `REF${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

export function PaymentGenerator() {
  // Initialize all hooks at the top level
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // State hooks
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: 0,
    currency: 'EUR',
    description: '',
    reference: generateReference(),
    recipientName: '',
    recipientIBAN: '',
    dueDate: new Date().toISOString().split('T')[0],
    clientId: '',
    client: undefined
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [qrCodeData, setQRCodeData] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Effects
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/clients');
        if (!response.ok) throw new Error('Failed to fetch clients');
        const data = await response.json();
        setClients(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch clients',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };
    fetchClients();
  }, [toast]);

  // Handle client selection
  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c._id.toString() === clientId);
    setSelectedClient(client || null);
    
    if (client) {
      setPaymentData(prev => ({
        ...prev,
        clientId,
        client,
        recipientName: client.fullName,
        description: client.company 
          ? `Payment for ${client.company}`
          : `Payment for ${client.fullName}`
      }));
    } else {
      setPaymentData(prev => ({
        ...prev,
        clientId: '',
        client: undefined,
        recipientName: '',
        description: ''
      }));
    }
  };

  const handleInputChange = (field: keyof PaymentData, value: any) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGeneratePayment = async () => {
    setIsLoading(true);
    try {
      if (!paymentData.amount || paymentData.amount <= 0) {
        toast({
          title: 'Error',
          description: 'Please enter a valid amount.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (!selectedClient) {
        toast({
          title: 'Error',
          description: 'Please select a client.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Save payment to MongoDB first
      const savePaymentResponse = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Number(paymentData.amount),
          currency: paymentData.currency,
          description: paymentData.description,
          reference: paymentData.reference,
          recipientName: paymentData.recipientName || selectedClient.fullName,
          recipientIBAN: paymentData.recipientIBAN,
          dueDate: paymentData.dueDate,
          clientId: selectedClient._id,
          status: PaymentStatus.PENDING
        }),
      });

      if (!savePaymentResponse.ok) {
        const errorData = await savePaymentResponse.json();
        throw new Error(errorData.error || 'Failed to save payment');
      }

      // Generate payment data string for QR code
      const paymentString = JSON.stringify({
        ...paymentData,
        timestamp: new Date().toISOString(),
      });
      
      setQRCodeData(paymentString);
      
      toast({
        title: 'Payment generated',
        description: 'Payment saved and QR code created successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error generating payment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Payment could not be generated.',
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
        title: 'Error',
        description: 'Please generate a payment first.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsGeneratingPDF(true);
    try {
      console.log('Payment Data being sent:', {
        amount: Number(paymentData.amount),
        currency: paymentData.currency,
        description: paymentData.description,
        reference: paymentData.reference,
        recipientName: paymentData.recipientName,
        recipientIBAN: paymentData.recipientIBAN,
        dueDate: paymentData.dueDate,
        clientId: selectedClient?._id,
        status: 'pending'
      });

      // Then generate the PDF
      const response = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentData: {
            ...paymentData,
            amount: Number(paymentData.amount) || 0,
            clientId: selectedClient?._id
          },
          qrCodeData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'PDF could not be created');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment-${paymentData.reference}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Success',
        description: 'Payment saved and PDF downloaded successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Reset the form after successful save
      setPaymentData({
        amount: 0,
        currency: 'EUR',
        description: '',
        reference: generateReference(),
        recipientName: '',
        recipientIBAN: '',
        dueDate: new Date().toISOString().split('T')[0],
        clientId: '',
        client: undefined
      });
      setSelectedClient(null);
      setQRCodeData('');

    } catch (error) {
      console.error('Error details:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to process payment',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleCopyReference = () => {
    navigator.clipboard.writeText(paymentData.reference);
    toast({
      title: 'Reference copied',
      description: 'The reference number was copied to the clipboard.',
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
        <Heading size="md" alignSelf="flex-start">Create New Payment</Heading>
        
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
          {/* Client Selection */}
          <FormControl isRequired>
            <FormLabel>Select Client</FormLabel>
            <Select
              placeholder="Select client"
              value={paymentData.clientId || ''}
              onChange={(e) => handleClientChange(e.target.value)}
            >
              {clients.map((client) => (
                <option key={client._id.toString()} value={client._id.toString()}>
                  {client.fullName} - {client.company || 'Individual'}
                </option>
              ))}
            </Select>
          </FormControl>

          {/* Display Client Information if selected */}
          {selectedClient && (
            <Box p={4} borderWidth="1px" borderRadius="md" bg={useColorModeValue('gray.50', 'gray.700')}>
              <VStack align="stretch" spacing={2}>
                <Heading size="sm" mb={2}>Client Information</Heading>
                <SimpleGrid columns={2} spacing={4}>
                  <Text><strong>Name:</strong> {selectedClient.fullName}</Text>
                  <Text><strong>Company:</strong> {selectedClient.company || 'N/A'}</Text>
                  <Text><strong>Email:</strong> {selectedClient.email}</Text>
                  <Text><strong>Phone:</strong> {selectedClient.phoneNumber}</Text>
                  <Text><strong>Address:</strong> {selectedClient.address}</Text>
                </SimpleGrid>
              </VStack>
            </Box>
          )}

          {/* Left Column - Payment Details */}
          <Box>
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel>Amount</FormLabel>
                <InputGroup>
                  <NumberInput
                    min={0}
                    precision={2}
                    value={paymentData.amount}
                    onChange={(_, value) => handleInputChange('amount', value)}
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
                <FormLabel>Currency</FormLabel>
                <Select
                  value={paymentData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input
                  value={paymentData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter payment description..."
                />
              </FormControl>
            </VStack>
          </Box>

          {/* Middle Column - Recipient Details */}
          <Box>
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel>Recipient Name</FormLabel>
                <Input
                  value={paymentData.recipientName}
                  onChange={(e) => handleInputChange('recipientName', e.target.value)}
                  placeholder="Enter recipient name"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Recipient IBAN</FormLabel>
                <Input
                  value={paymentData.recipientIBAN}
                  onChange={(e) => handleInputChange('recipientIBAN', e.target.value)}
                  placeholder="DE89 3704 0044 0532 0130 00"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Due Date</FormLabel>
                <Input
                  type="date"
                  value={paymentData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Reference</FormLabel>
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
                    Download PDF
                  </Button>
                </>
              ) : (
                <Text color="gray.500" textAlign="center">
                  QR code will be displayed here after generation
                </Text>
              )}
              
              <Button
                colorScheme="purple"
                onClick={handleGeneratePayment}
                isLoading={isLoading}
                w="full"
              >
                Generate Payment
              </Button>
            </VStack>
          </Box>
        </SimpleGrid>
      </VStack>
    </Box>
  );
}
