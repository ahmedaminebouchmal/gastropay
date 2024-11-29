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
import { PaymentStatus, Payment } from '@/types';
import { Schema } from 'mongoose';

type ClientIdType = string | { _id: string } | undefined;

const getObjectId = (id: Schema.Types.ObjectId | string): string => {
  if (typeof id === 'string') return id;
  return id.toString();
};

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

interface PaymentGeneratorProps {
  onClose: () => void;
  onPaymentCreated: () => Promise<void>;
  payment?: Payment;
}

interface PaymentFormData {
  amount: string;
  currency: string;
  description: string;
  reference: string;
  recipientName: string;
  recipientIBAN: string;
  dueDate: string;
  clientId: string;
  status: PaymentStatus;
}

function generateReference() {
  return `REF${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

export const PaymentGenerator: React.FC<PaymentGeneratorProps> = ({
  onClose,
  onPaymentCreated,
  payment
}) => {
  // Initialize all hooks at the top level
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // State hooks
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: payment?.amount?.toString() || '',
    currency: payment?.currency || 'EUR',
    dueDate: payment?.dueDate ? new Date(payment.dueDate).toISOString().split('T')[0] : '',
    clientId: payment?.clientId ? getObjectId(
      typeof payment.clientId === 'object' && '_id' in payment.clientId 
        ? payment.clientId._id 
        : payment.clientId
    ) : '',
    description: payment?.description || '',
    reference: payment?.reference || generateReference(),
    recipientName: payment?.recipientName || '',
    recipientIBAN: payment?.recipientIBAN || '',
    status: payment?.status || PaymentStatus.PENDING
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [qrCodeData, setQRCodeData] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form data when payment prop changes or component mounts
  useEffect(() => {
    setFormData({
      amount: payment?.amount?.toString() || '',
      currency: payment?.currency || 'EUR',
      dueDate: payment?.dueDate ? new Date(payment.dueDate).toISOString().split('T')[0] : '',
      clientId: payment?.clientId ? getObjectId(
        typeof payment.clientId === 'object' && '_id' in payment.clientId 
          ? payment.clientId._id 
          : payment.clientId
      ) : '',
      description: payment?.description || '',
      reference: payment?.reference || generateReference(),
      recipientName: payment?.recipientName || '',
      recipientIBAN: payment?.recipientIBAN || '',
      status: payment?.status || PaymentStatus.PENDING
    });
    setSelectedClient(null);
    setQRCodeData('');
    setIsSubmitting(false);
    setIsGeneratingPDF(false);
  }, [payment]);

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
  const handleClientChange = async (clientId: string) => {
    const client = clients.find(c => getObjectId(c._id) === clientId);
    setSelectedClient(client || null);
    
    if (client) {
      setFormData(prev => ({
        ...prev,
        clientId: getObjectId(client._id),
        recipientName: client.fullName,
        description: client.company 
          ? `Payment for ${client.company}`
          : `Payment for ${client.fullName}`
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        clientId: '',
        recipientName: '',
        description: ''
      }));
    }
  };

  const handleInputChange = (field: keyof PaymentFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Update or create the payment
      const endpoint = payment ? `/api/payments?id=${payment._id}` : '/api/payments';
      const method = payment ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          clientId: formData.clientId || null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save payment');
      }

      const savedPayment = await response.json();

      // 2. Generate new Stripe checkout session
      const stripeResponse = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: savedPayment.reference }),
      });

      if (!stripeResponse.ok) {
        throw new Error('Failed to create Stripe checkout session');
      }

      const { url: stripeUrl } = await stripeResponse.json();

      // 3. Generate new PDF with updated payment info and Stripe URL
      const pdfResponse = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentData: {
            ...savedPayment,
            amount: Number(savedPayment.amount),
            client: savedPayment.clientId
          },
          qrCodeData: stripeUrl,
        }),
      });

      if (!pdfResponse.ok) {
        throw new Error('Failed to generate PDF');
      }

      const pdfBlob = await pdfResponse.blob();
      const pdfBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(pdfBlob);
      });

      // 4. Send email with payment details and PDF
      if (selectedClient?.email) {
        const emailResponse = await fetch('/api/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clientName: selectedClient.fullName || selectedClient.company || 'Valued Customer',
            clientEmail: selectedClient.email,
            amount: Number(formData.amount),
            currency: formData.currency,
            reference: formData.reference,
            description: formData.description,
            paymentLink: stripeUrl,
            dueDate: formData.dueDate || undefined,
            attachments: [{
              content: pdfBase64,
              filename: `payment-${formData.reference}.pdf`,
              type: 'application/pdf',
              disposition: 'attachment'
            }]
          }),
        });

        if (!emailResponse.ok) {
          console.error('Failed to send email notification');
          toast({
            title: 'Email Notification',
            description: 'Payment created successfully, but there was an issue sending the email notification.',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
        }
      }

      // Set QR code data for display
      setQRCodeData(stripeUrl);

      toast({
        title: payment ? 'Zahlung aktualisiert' : 'Zahlung erstellt',
        description: payment 
          ? 'Die Zahlung wurde erfolgreich aktualisiert' 
          : 'Die Zahlung wurde erfolgreich erstellt',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      await onPaymentCreated();
      onClose();
    } catch (error) {
      console.error('Error saving payment:', error);
      toast({
        title: 'Fehler',
        description: payment 
          ? 'Fehler beim Aktualisieren der Zahlung' 
          : 'Fehler beim Erstellen der Zahlung',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGeneratePDF = async (paymentData: any, stripeUrl: string) => {
    setIsGeneratingPDF(true);
    try {
      // Prepare payment data for PDF generation
      const pdfPaymentData = {
        reference: paymentData.reference,
        amount: Number(paymentData.amount),
        currency: paymentData.currency,
        description: paymentData.description,
        dueDate: paymentData.dueDate,
        recipientName: paymentData.recipientName || selectedClient?.fullName,
        recipientIBAN: paymentData.recipientIBAN,
        // Ensure client data is included
        client: {
          fullName: selectedClient?.fullName || '',
          company: selectedClient?.company || '',
          email: selectedClient?.email || '',
          phoneNumber: selectedClient?.phoneNumber || '',
          address: selectedClient?.address || ''
        }
      };

      console.log('Sending PDF data:', pdfPaymentData); // Debug log

      const response = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentData: pdfPaymentData,
          qrCodeData: stripeUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to generate PDF');
      }

      const pdfBlob = await response.blob();
      const pdfBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(pdfBlob);
      });

      // 4. Send email with payment details and PDF
      if (selectedClient?.email) {
        const emailResponse = await fetch('/api/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clientName: selectedClient.fullName || selectedClient.company || 'Valued Customer',
            clientEmail: selectedClient.email,
            amount: Number(formData.amount),
            currency: formData.currency,
            reference: formData.reference,
            description: formData.description,
            paymentLink: stripeUrl,
            dueDate: formData.dueDate || undefined,
            attachments: [{
              content: pdfBase64,
              filename: `payment-${formData.reference}.pdf`,
              type: 'application/pdf',
              disposition: 'attachment'
            }]
          }),
        });

        if (!emailResponse.ok) {
          console.error('Failed to send email notification');
          toast({
            title: 'Email Notification',
            description: 'Payment created successfully, but there was an issue sending the email notification.',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
        }
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
        description: 'PDF generated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('PDF generation error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate PDF',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleGeneratePDFClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!qrCodeData) {
      toast({
        title: 'Error',
        description: 'Please generate a payment first',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    handleGeneratePDF(formData, qrCodeData);
  };

  const handleCopyReference = () => {
    navigator.clipboard.writeText(formData.reference);
    toast({
      title: 'Reference copied',
      description: 'The reference number was copied to the clipboard.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleRefreshReference = () => {
    setFormData(prev => ({
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
              value={formData.clientId || ''}
              onChange={(e) => handleClientChange(e.target.value)}
            >
              {clients.map((client) => (
                <option 
                  key={getObjectId(client._id)}
                  value={getObjectId(client._id)}
                >
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
                    value={formData.amount}
                    onChange={(_, value) => handleInputChange('amount', value)}
                    w="full"
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <InputRightAddon>{formData.currency}</InputRightAddon>
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel>Currency</FormLabel>
                <Select
                  value={formData.currency}
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
                  value={formData.description}
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
                  value={formData.recipientName}
                  onChange={(e) => handleInputChange('recipientName', e.target.value)}
                  placeholder="Enter recipient name"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Recipient IBAN</FormLabel>
                <Input
                  value={formData.recipientIBAN}
                  onChange={(e) => handleInputChange('recipientIBAN', e.target.value)}
                  placeholder="DE89 3704 0044 0532 0130 00"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Due Date</FormLabel>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Reference</FormLabel>
                <InputGroup>
                  <Input
                    value={formData.reference}
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
                    onClick={handleGeneratePDFClick}
                    isLoading={isGeneratingPDF}
                    w="full"
                  >
                    Generate PDF
                  </Button>
                </>
              ) : (
                <Text color="gray.500" textAlign="center">
                  QR code will be displayed here after generation
                </Text>
              )}
              
              <Button
                colorScheme="purple"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                w="full"
              >
                {payment ? 'Save Changes' : 'Generate Payment'}
              </Button>
            </VStack>
          </Box>
        </SimpleGrid>
      </VStack>
    </Box>
  );
}
