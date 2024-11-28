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
} from '@chakra-ui/react';
import { FiPlus, FiFilter, FiMoreVertical, FiDownload, FiEye, FiTrash2 } from 'react-icons/fi';
import { PaymentGenerator } from '@/components/payments/Generator/PaymentGenerator';
import { useState } from 'react';
import { Payment, PaymentStatus } from '@/types';

export default function PaymentsPage() {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [payments, setPayments] = useState<Payment[]>([]); // Will be populated with real data
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

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

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    // TODO: Implement view functionality
  };

  const handleDeletePayment = async (payment: Payment) => {
    // TODO: Implement delete functionality
    console.log('Delete payment:', payment);
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

          {/* Payment List */}
          <Box
            bg={cardBg}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
            overflow="hidden"
          >
            <Tabs colorScheme="purple">
              <TabList px={4}>
                <Tab>Alle</Tab>
                <Tab>Ausstehend</Tab>
                <Tab>Bezahlt</Tab>
                <Tab>Bestätigt</Tab>
                <Tab>Abgelehnt</Tab>
              </TabList>

              <TabPanels>
                <TabPanel p={0}>
                  <Box overflowX="auto">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid', borderColor: borderColor }}>Referenz</th>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid', borderColor: borderColor }}>Kunde</th>
                          <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid', borderColor: borderColor }}>Betrag</th>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid', borderColor: borderColor }}>Status</th>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid', borderColor: borderColor }}>Fällig am</th>
                          <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid', borderColor: borderColor }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ padding: '24px', textAlign: 'center' }}>
                              <Text color="gray.500">Keine Zahlungen vorhanden</Text>
                            </td>
                          </tr>
                        ) : (
                          payments.map((payment) => (
                            <tr key={payment._id.toString()}>
                              <td style={{ padding: '12px', borderBottom: '1px solid', borderColor: borderColor }}>
                                {payment.reference}
                              </td>
                              <td style={{ padding: '12px', borderBottom: '1px solid', borderColor: borderColor }}>
                                {/* TODO: Add client name */}
                                Client Name
                              </td>
                              <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid', borderColor: borderColor }}>
                                {payment.amount.toFixed(2)} €
                              </td>
                              <td style={{ padding: '12px', borderBottom: '1px solid', borderColor: borderColor }}>
                                <Badge colorScheme={getStatusColor(payment.status)}>
                                  {payment.status}
                                </Badge>
                              </td>
                              <td style={{ padding: '12px', borderBottom: '1px solid', borderColor: borderColor }}>
                                {new Date(payment.dueDate).toLocaleDateString('de-DE')}
                              </td>
                              <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid', borderColor: borderColor }}>
                                <Menu>
                                  <MenuButton
                                    as={IconButton}
                                    icon={<FiMoreVertical />}
                                    variant="ghost"
                                    size="sm"
                                  />
                                  <MenuList>
                                    <MenuItem
                                      icon={<FiEye />}
                                      onClick={() => handleViewPayment(payment)}
                                    >
                                      Anzeigen
                                    </MenuItem>
                                    <MenuItem
                                      icon={<FiDownload />}
                                      onClick={() => {/* TODO: Handle download */}}
                                    >
                                      PDF herunterladen
                                    </MenuItem>
                                    <MenuItem
                                      icon={<FiTrash2 />}
                                      onClick={() => handleDeletePayment(payment)}
                                      color="red.500"
                                    >
                                      Löschen
                                    </MenuItem>
                                  </MenuList>
                                </Menu>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </Box>
                </TabPanel>
                <TabPanel>
                  <Text p={4} color="gray.500">Ausstehende Zahlungen werden hier angezeigt</Text>
                </TabPanel>
                <TabPanel>
                  <Text p={4} color="gray.500">Bezahlte Zahlungen werden hier angezeigt</Text>
                </TabPanel>
                <TabPanel>
                  <Text p={4} color="gray.500">Bestätigte Zahlungen werden hier angezeigt</Text>
                </TabPanel>
                <TabPanel>
                  <Text p={4} color="gray.500">Abgelehnte Zahlungen werden hier angezeigt</Text>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </VStack>
      </Container>

      {/* Payment Form Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent maxWidth="1400px">
          <ModalHeader>Neue Zahlung erstellen</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <PaymentGenerator />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
