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
  Legend,
  Filler,
  ChartOptions,
  ScaleOptions,
  CartesianScaleOptions
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RevenueChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      tension: number;
      fill?: boolean;
      backgroundColor?: string;
      pointBackgroundColor?: string;
      pointBorderColor?: string;
      pointHoverBackgroundColor?: string;
      pointHoverBorderColor?: string;
      pointBorderWidth?: number;
      pointHoverBorderWidth?: number;
      pointRadius?: number;
      pointHoverRadius?: number;
      borderWidth?: number;
    }[];
  };
}

export function RevenueChart({ data }: RevenueChartProps) {
  const gridColor = useColorModeValue('rgba(0,0,0,0.06)', 'rgba(255,255,255,0.06)');
  const textColor = useColorModeValue('rgba(0,0,0,0.7)', 'rgba(255,255,255,0.7)');
  const tooltipBgColor = useColorModeValue('rgba(255,255,255,0.9)', 'rgba(0,0,0,0.9)');
  const tooltipTitleColor = useColorModeValue('#1A202C', '#FFFFFF');
  const tooltipBodyColor = useColorModeValue('#1A202C', '#FFFFFF');
  const tooltipBorderColor = useColorModeValue('rgba(0,0,0,0.1)', 'rgba(255,255,255,0.1)');

  const options: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: tooltipBgColor,
        titleColor: tooltipTitleColor,
        bodyColor: tooltipBodyColor,
        borderColor: tooltipBorderColor,
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('de-DE', {
                style: 'currency',
                currency: 'EUR'
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear' as const,
        beginAtZero: true,
        grid: {
          color: gridColor,
          display: true
        },
        ticks: {
          color: textColor,
          padding: 10,
          callback: function(value: any) {
            return new Intl.NumberFormat('de-DE', {
              style: 'currency',
              currency: 'EUR',
              notation: 'compact',
              maximumFractionDigits: 1
            }).format(value);
          }
        },
        border: {
          display: false
        }
      },
      x: {
        type: 'category' as const,
        grid: {
          display: false
        },
        ticks: {
          color: textColor,
          padding: 10
        },
        border: {
          display: false
        }
      }
    },
    maintainAspectRatio: false,
    elements: {
      line: {
        borderWidth: 2,
      },
      point: {
        hitRadius: 8,
      }
    }
  };

  return (
    <Box w="100%" h="100%" p={2}>
      <Line data={data} options={options} />
    </Box>
  );
}
