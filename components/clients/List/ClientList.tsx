import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Box,
  useColorModeValue,
  Text,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Button,
} from '@chakra-ui/react';
import { FiStar, FiMoreVertical, FiEdit2, FiTrash2, FiFileText } from 'react-icons/fi';
import { Client } from '@/types';

interface ClientListProps {
  clients: Client[];
  onEdit?: (client: Client) => void;
  onDelete?: (client: Client) => void;
  onViewInvoices?: (client: Client) => void;
  onRate?: (client: Client) => void;
}

export function ClientList({ clients, onEdit, onDelete, onViewInvoices, onRate }: ClientListProps) {
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box overflowX="auto">
      <Table variant="simple" w="full">
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th>E-Mail</Th>
            <Th>Firma</Th>
            <Th>Telefon</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {clients.map((client) => (
            <Tr key={client._id.toString()}>
              <Td>{client.fullName}</Td>
              <Td>{client.email}</Td>
              <Td>{client.company || '-'}</Td>
              <Td>{client.phoneNumber}</Td>
              <Td>
                <HStack spacing={2} justifyContent="flex-end">
                  <IconButton
                    aria-label="Rate client"
                    icon={<FiStar />}
                    variant="ghost"
                    colorScheme="yellow"
                    onClick={() => onRate?.(client)}
                    _hover={{
                      bg: 'yellow.100',
                      color: 'yellow.500',
                    }}
                  />
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      aria-label="Options"
                      icon={<FiMoreVertical />}
                      variant="ghost"
                      size="md"
                    />
                    <MenuList>
                      <MenuItem
                        icon={<FiFileText />}
                        onClick={() => onViewInvoices?.(client)}
                      >
                        Rechnungen anzeigen
                      </MenuItem>
                      <MenuItem
                        icon={<FiEdit2 />}
                        onClick={() => onEdit?.(client)}
                      >
                        Bearbeiten
                      </MenuItem>
                      <MenuDivider />
                      <MenuItem
                        icon={<FiTrash2 />}
                        color="red.500"
                        onClick={() => onDelete?.(client)}
                      >
                        Löschen
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      {clients.length === 0 && (
        <Box textAlign="center" py={8}>
          <Text color="gray.500">Keine Kunden gefunden</Text>
        </Box>
      )}
    </Box>
  );
}
