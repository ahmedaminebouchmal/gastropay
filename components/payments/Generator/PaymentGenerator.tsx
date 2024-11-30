import { useState, useEffect, useMemo } from 'react';
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
  IconButton
} from '@chakra-ui/react';
import { QRCode } from '../QRCode/QRCode';
import { FiDownload, FiRefreshCw, FiCopy } from 'react-icons/fi';
import { Client } from '@/types';
import { PaymentStatus, Payment } from '@/types';
import { Schema } from 'mongoose';

type ClientIdType = string | { _id: string } | undefined;

const generateReference = () => {
  const prefix = 'INV';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

const getObjectId = (id: any): string => {
  if (typeof id === 'string') return id;
  if (typeof id === 'object' && id !== null) {
    if ('toString' in id) return id.toString();
    if ('_id' in id) return getObjectId(id._id);
  }
  return '';
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

export const PaymentGenerator: React.FC<PaymentGeneratorProps> = ({
  onClose,
  onPaymentCreated,
  payment
}) => {
  // Initialize all hooks at the top level
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const labelColor = useColorModeValue('gray.600', 'gray.300');
  const inputBgColor = useColorModeValue('white', 'gray.700');
  const inputBorderColor = useColorModeValue('gray.300', 'gray.600');

  // State hooks
  const initialFormData = useMemo(() => ({
    amount: '',
    currency: 'EUR',
    dueDate: '',
    clientId: '',
    description: '',
    reference: generateReference(),
    recipientName: '',
    recipientIBAN: '',
    status: PaymentStatus.PENDING
  }), []);

  const [formData, setFormData] = useState<PaymentFormData>(initialFormData);

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [qrCodeData, setQRCodeData] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentFormData = useMemo(() => {
    if (!payment) return formData;
    
    return {
      amount: payment.amount?.toString() || '',
      currency: payment.currency || 'EUR',
      dueDate: payment.dueDate ? new Date(payment.dueDate).toISOString().split('T')[0] : '',
      clientId: payment.clientId ? getObjectId(
        typeof payment.clientId === 'object' && '_id' in payment.clientId 
          ? payment.clientId._id 
          : payment.clientId
      ) : '',
      description: payment.description || '',
      reference: payment.reference || generateReference(),
      recipientName: payment.recipientName || '',
      recipientIBAN: payment.recipientIBAN || '',
      status: payment.status || PaymentStatus.PENDING
    };
  }, [payment, formData]);

  // Initialize form data from payment prop
  useEffect(() => {
    setFormData(currentFormData);
  }, [currentFormData]);

  // Load client data when payment prop changes
  useEffect(() => {
    const loadPaymentData = async () => {
      // If payment has client data, set it as selected client
      if (payment?.clientId && typeof payment.clientId === 'object' && '_id' in payment.clientId) {
        setSelectedClient(payment.clientId);
      } else if (payment?.clientId) {
        // Fetch client data if we only have the ID
        try {
          const response = await fetch(`/api/clients?id=${payment.clientId}`);
          if (response.ok) {
            const clientData = await response.json();
            setSelectedClient(clientData);
          }
        } catch (error) {
          console.error('Error fetching client data:', error);
        }
      } else {
        setSelectedClient(null);
      }

      setQRCodeData('');
      setIsSubmitting(false);
      setIsGeneratingPDF(false);
    };

    loadPaymentData();
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
    
    if (!formData.amount || !formData.currency) {
      toast({
        title: 'Fehler',
        description: 'Bitte füllen Sie alle Pflichtfelder aus',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      // 1. Save or update the payment
      const endpoint = payment ? `/api/payments/${payment._id}` : '/api/payments';
      const method = payment ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Speichern der Zahlung');
      }

      const savedPayment = await response.json();
      console.log('Saved payment response:', savedPayment);

      // Get client info from the saved payment response
      const clientInfo = savedPayment.client || savedPayment.clientId;
      console.log('Client info from response:', clientInfo);
      
      if (!clientInfo) {
        console.error('No client information in response');
        throw new Error('Keine Kundeninformationen gefunden');
      }
      
      if (!clientInfo.email) {
        console.error('No email in client information');
        throw new Error('Keine E-Mail-Adresse für den Kunden gefunden');
      }
      
      if (!clientInfo.fullName && !clientInfo.name) {
        console.error('No name in client information');
        throw new Error('Kein Name für den Kunden gefunden');
      }

      // 2. Generate Stripe checkout session
      const stripeResponse = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference: savedPayment.reference }),
      });

      if (!stripeResponse.ok) {
        throw new Error('Fehler beim Erstellen der Zahlungssitzung');
      }

      const { url: stripeUrl } = await stripeResponse.json();

      // 3. Generate PDF with payment info and Stripe URL
      const pdfResponse = await fetch('/api/pdf/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentData: {
            ...savedPayment,
            amount: Number(savedPayment.amount),
            client: clientInfo
          },
          qrCodeData: stripeUrl,
        }),
      });

      if (!pdfResponse.ok) {
        throw new Error('Fehler beim Generieren des PDFs');
      }

      const pdfBlob = await pdfResponse.blob();
      const pdfBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(pdfBlob);
      });

      // 4. Send email with payment details and PDF
      const emailResponse = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientEmail: clientInfo.email,
          clientName: clientInfo.fullName,
          amount: savedPayment.amount,
          currency: savedPayment.currency,
          reference: savedPayment.reference,
          paymentLink: stripeUrl,
          description: savedPayment.description !== 'null' ? savedPayment.description : undefined,
          dueDate: savedPayment.dueDate,
          attachments: [{
            content: pdfBase64,
            filename: `payment-${savedPayment.reference}.pdf`,
            type: 'application/pdf',
            disposition: 'attachment'
          }],
          isUpdate: !!payment,
        }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        throw new Error(errorData.error || 'Fehler beim Senden der E-Mail');
      }

      toast({
        title: payment ? 'Zahlung aktualisiert' : 'Zahlung erstellt',
        description: payment 
          ? 'Die Zahlung wurde erfolgreich aktualisiert' 
          : 'Die Zahlung wurde erfolgreich erstellt und eine E-Mail wurde versendet',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      await onPaymentCreated();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Fehler',
        description: error.message || 'Fehler beim Speichern der Zahlung',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
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
        throw new Error(errorData.details || 'Fehler beim Generieren des PDFs');
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
        title: 'Erfolg',
        description: 'PDF wurde erfolgreich generiert',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('PDF generation error:', error);
      toast({
        title: 'Fehler',
        description: error.message || 'Fehler beim Generieren des PDFs',
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
      title: 'Referenz kopiert',
      description: 'Die Referenznummer wurde in die Zwischenablage kopiert.',
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
      as="form"
      onSubmit={handleSubmit}
      bg={bgColor}
      p={6}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      width="100%"
      color={textColor}
    >
      <VStack spacing={6} align="stretch">
        <Heading size="md" color={textColor}>{payment ? 'Zahlung bearbeiten' : 'Neue Zahlung erstellen'}</Heading>
        
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <FormControl isRequired>
            <FormLabel color={labelColor}>Betrag</FormLabel>
            <InputGroup>
              <NumberInput
                value={formData.amount}
                onChange={(value) => handleInputChange('amount', value)}
                min={0}
                precision={2}
                width="full"
                bg={inputBgColor}
                borderColor={inputBorderColor}
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
            <FormLabel color={labelColor}>Währung</FormLabel>
            <Select
              name="currency"
              value={formData.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              bg={inputBgColor}
              borderColor={inputBorderColor}
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
              <option value="CHF">CHF</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel color={labelColor}>Fälligkeitsdatum</FormLabel>
            <Input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              bg={inputBgColor}
              borderColor={inputBorderColor}
            />
          </FormControl>

          <FormControl>
            <FormLabel color={labelColor}>Kunde</FormLabel>
            <Select
              name="clientId"
              value={formData.clientId}
              onChange={(e) => handleInputChange('clientId', e.target.value)}
              placeholder="Kunde auswählen"
              bg={inputBgColor}
              borderColor={inputBorderColor}
            >
              {clients.map((client) => (
                <option key={client._id.toString()} value={client._id.toString()}>
                  {client.fullName} {client.company ? `(${client.company})` : ''}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel color={labelColor}>Beschreibung</FormLabel>
            <Input
              name="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Beschreibung der Zahlung"
              bg={inputBgColor}
              borderColor={inputBorderColor}
            />
          </FormControl>

          <FormControl>
            <FormLabel color={labelColor}>Referenz</FormLabel>
            <InputGroup>
              <Input
                name="reference"
                value={formData.reference}
                onChange={(e) => handleInputChange('reference', e.target.value)}
                isReadOnly
                bg={inputBgColor}
                borderColor={inputBorderColor}
              />
              <InputRightElement>
                <IconButton
                  aria-label="Neue Referenz generieren"
                  icon={<FiRefreshCw />}
                  size="sm"
                  variant="ghost"
                  onClick={() => handleInputChange('reference', generateReference())}
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <FormControl>
            <FormLabel color={labelColor}>Empfänger Name</FormLabel>
            <Input
              name="recipientName"
              value={formData.recipientName}
              onChange={(e) => handleInputChange('recipientName', e.target.value)}
              placeholder="Name des Empfängers"
              bg={inputBgColor}
              borderColor={inputBorderColor}
            />
          </FormControl>

          <FormControl>
            <FormLabel color={labelColor}>Empfänger IBAN</FormLabel>
            <Input
              name="recipientIBAN"
              value={formData.recipientIBAN}
              onChange={(e) => handleInputChange('recipientIBAN', e.target.value)}
              placeholder="IBAN des Empfängers"
              bg={inputBgColor}
              borderColor={inputBorderColor}
            />
          </FormControl>

          {payment && (
            <FormControl>
              <FormLabel color={labelColor}>Status</FormLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                bg={inputBgColor}
                borderColor={inputBorderColor}
              >
                <option value={PaymentStatus.PENDING}>Ausstehend</option>
                <option value={PaymentStatus.PAID}>Bezahlt</option>
                <option value={PaymentStatus.CONFIRMED}>Bestätigt</option>
                <option value={PaymentStatus.DECLINED}>Abgelehnt</option>
              </Select>
            </FormControl>
          )}
        </SimpleGrid>

        <Divider />

        <HStack spacing={4} justify="flex-end">
          <Button onClick={onClose} variant="ghost">
            Abbrechen
          </Button>
          <Button
            type="submit"
            colorScheme="purple"
            isLoading={isLoading}
            loadingText="Speichern..."
          >
            {payment ? 'Aktualisieren' : 'Erstellen'}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}
