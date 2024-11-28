import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  FormErrorMessage,
  SimpleGrid,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = yup.object().shape({
  fullName: yup.string().required('Name ist erforderlich'),
  email: yup.string().email('Ungültige E-Mail').required('E-Mail ist erforderlich'),
  phoneNumber: yup
    .string()
    .required('Telefonnummer ist erforderlich')
    .min(7, 'Telefonnummer muss mindestens 7 Zeichen lang sein')
    .matches(/^[0-9+\-\s()]*$/, 'Telefonnummer darf nur Zahlen, +, -, () und Leerzeichen enthalten'),
  address: yup.string().required('Adresse ist erforderlich'),
  company: yup.string(),
});

interface ClientFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  company?: string;
}

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormData) => Promise<void>;
}

export function ClientForm({ isOpen, onClose, onSubmit }: ClientFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleFormSubmit = async (data: ClientFormData) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      toast({
        title: 'Kunde erstellt',
        description: 'Der Kunde wurde erfolgreich angelegt.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Fehler',
        description: 'Der Kunde konnte nicht angelegt werden.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size="4xl"
      motionPreset="slideInBottom"
    >
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent mx={4}>
        <ModalHeader>Neuer Kunde</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <ModalBody pb={6}>
            <VStack spacing={6}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                <FormControl isInvalid={!!errors.fullName}>
                  <FormLabel>Name</FormLabel>
                  <Input {...register('fullName')} />
                  <FormErrorMessage>{errors.fullName?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.email}>
                  <FormLabel>E-Mail</FormLabel>
                  <Input {...register('email')} type="email" />
                  <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.phoneNumber}>
                  <FormLabel>Telefon</FormLabel>
                  <Input {...register('phoneNumber')} />
                  <FormErrorMessage>{errors.phoneNumber?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.company}>
                  <FormLabel>Firma (Optional)</FormLabel>
                  <Input {...register('company')} />
                  <FormErrorMessage>{errors.company?.message}</FormErrorMessage>
                </FormControl>
              </SimpleGrid>

              <FormControl isInvalid={!!errors.address}>
                <FormLabel>Adresse</FormLabel>
                <Input {...register('address')} />
                <FormErrorMessage>{errors.address?.message}</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onClose}>
              Abbrechen
            </Button>
            <Button
              type="submit"
              colorScheme="purple"
              isLoading={isLoading}
              loadingText="Wird angelegt..."
            >
              Kunde anlegen
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
