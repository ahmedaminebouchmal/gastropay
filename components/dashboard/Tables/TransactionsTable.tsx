import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Box,
  useColorModeValue,
  Text,
} from '@chakra-ui/react';
import { translations } from '@/translations/de';

interface Transaction {
  id: number;
  user: string;
  amount: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
}

interface TransactionsTableProps {
  transactions: Transaction[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Box overflowX="auto">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th borderColor={borderColor}>{translations.dashboard.user}</Th>
            <Th borderColor={borderColor}>{translations.dashboard.amount}</Th>
            <Th borderColor={borderColor}>{translations.dashboard.status}</Th>
            <Th borderColor={borderColor}>{translations.dashboard.date}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {transactions.map((transaction) => (
            <Tr key={transaction.id}>
              <Td borderColor={borderColor}>
                <Text fontWeight="medium">{transaction.user}</Text>
              </Td>
              <Td borderColor={borderColor}>
                <Text>{transaction.amount}</Text>
              </Td>
              <Td borderColor={borderColor}>
                <Badge
                  colorScheme={getStatusColor(transaction.status)}
                  px={2}
                  py={1}
                  rounded="full"
                >
                  {translations.dashboard[transaction.status]}
                </Badge>
              </Td>
              <Td borderColor={borderColor}>
                <Text color={useColorModeValue('gray.600', 'gray.400')}>
                  {transaction.date}
                </Text>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
