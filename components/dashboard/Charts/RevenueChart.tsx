import { Box, useColorModeValue } from '@chakra-ui/react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface RevenueChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      tension: number;
    }[];
  };
}

export function RevenueChart({ data }: RevenueChartProps) {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: useColorModeValue('gray.200', 'gray.700'),
        },
        ticks: {
          color: useColorModeValue('gray.600', 'gray.400'),
        }
      },
      x: {
        grid: {
          color: useColorModeValue('gray.200', 'gray.700'),
        },
        ticks: {
          color: useColorModeValue('gray.600', 'gray.400'),
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    hover: {
      mode: 'nearest' as const,
      intersect: true,
    },
  };

  return (
    <Box h="300px">
      <Line data={data} options={options} />
    </Box>
  );
}
