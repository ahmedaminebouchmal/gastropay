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
  name: yup.string().required('Name ist erforderlich'),
  email: yup.string().email('Ungültige E-Mail').required('E-Mail ist erforderlich'),
  address: yup.string().required('Adresse ist erforderlich'),
  phone: yup.string().required('Telefonnummer ist erforderlich'),
  company: yup.string().required('Firma ist erforderlich'),
  vatNumber: yup.string().required('USt-IdNr. ist erforderlich'),
});

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
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

  const handleFormSubmit = async (data: any) => {
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
                <FormControl isInvalid={!!errors.name}>
                  <FormLabel>Name</FormLabel>
                  <Input {...register('name')} />
                  <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.email}>
                  <FormLabel>E-Mail</FormLabel>
                  <Input {...register('email')} type="email" />
                  <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.phone}>
                  <FormLabel>Telefon</FormLabel>
                  <Input {...register('phone')} />
                  <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.company}>
                  <FormLabel>Firma</FormLabel>
                  <Input {...register('company')} />
                  <FormErrorMessage>{errors.company?.message}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!errors.vatNumber}>
                  <FormLabel>USt-IdNr.</FormLabel>
                  <Input {...register('vatNumber')} />
                  <FormErrorMessage>{errors.vatNumber?.message}</FormErrorMessage>
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
