import {
  Box,
  useColorModeValue,
  HStack,
  IconButton,
  Tooltip,
  Flex,
  VStack,
  Text,
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { Client } from '@/types';
import { ClientInfoCard } from '../Details/ClientInfoCard';

interface ClientListProps {
  clients: Client[];
  onEdit?: (client: Client) => void;
  onDelete?: (client: Client) => void;
  onView?: (client: Client) => void;
}

export function ClientList({ clients, onEdit, onDelete, onView }: ClientListProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  if (!clients || clients.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500">Keine Kunden gefunden</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch" w="full">
      {clients.map((client) => (
        <Box
          key={client._id.toString()}
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
              <ClientInfoCard client={client} />
            </Box>

            <HStack spacing={2}>
              {onView && (
                <Tooltip label="Details anzeigen">
                  <IconButton
                    aria-label="View client"
                    icon={<FiEye />}
                    variant="ghost"
                    colorScheme="purple"
                    size="sm"
                    onClick={() => onView(client)}
                  />
                </Tooltip>
              )}
              
              {onEdit && (
                <Tooltip label="Bearbeiten">
                  <IconButton
                    aria-label="Edit client"
                    icon={<FiEdit2 />}
                    variant="ghost"
                    colorScheme="purple"
                    size="sm"
                    onClick={() => onEdit(client)}
                  />
                </Tooltip>
              )}
              
              {onDelete && (
                <Tooltip label="Löschen">
                  <IconButton
                    aria-label="Delete client"
                    icon={<FiTrash2 />}
                    variant="ghost"
                    colorScheme="red"
                    size="sm"
                    onClick={() => onDelete(client)}
                  />
                </Tooltip>
              )}
            </HStack>
          </Flex>
        </Box>
      ))}
    </VStack>
  );
}
