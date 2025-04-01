import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  Stack,
  Card, 
  CardContent, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { getAllUsage } from '@/apis/monitoring/aiUsage/client';
import { AIUsageRecord, AIUsageSummary } from '@/server/ai-usage-monitoring/types';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
          {children}
        </Box>
      )}
    </div>
  );
};

export const AIMonitoring = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<AIUsageRecord[]>([]);
  const [summary, setSummary] = useState<AIUsageSummary | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getAllUsage();
        
        if (response.data.success) {
          setRecords(response.data.records);
          setSummary(response.data.summary);
        } else {
          setError(response.data.error || 'Unknown error occurred');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch AI usage data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return `$${value.toFixed(4)}`;
  };

  // Format large numbers
  const formatNumber = (value: number) => {
    return value.toLocaleString();
  };

  // Prepare data for daily usage chart
  const getDailyUsageData = () => {
    if (!summary) return [];
    
    return Object.entries(summary.usageByDay).map(([date, data]) => ({
      date,
      cost: parseFloat(data.totalCost.toFixed(4)),
      tokens: data.totalTokens,
      requests: data.count
    })).sort((a, b) => a.date.localeCompare(b.date));
  };

  // Prepare data for model usage pie chart
  const getModelUsageData = () => {
    if (!summary) return [];
    
    return Object.entries(summary.usageByModel).map(([model, data]) => ({
      name: model,
      value: data.totalCost,
      tokens: data.totalTokens,
      count: data.count
    }));
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 } }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
        AI Usage Monitoring
      </Typography>
      
      {/* Summary Cards */}
      {summary && (
        <Box sx={{ mb: { xs: 2, sm: 4 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2 }} sx={{ mb: { xs: 1, sm: 2 } }}>
            <Card sx={{ flex: 1 }}>
              <CardContent sx={{ py: { xs: 1.5 }, px: { xs: 2 } }}>
                <Typography color="textSecondary" gutterBottom variant={isMobile ? 'body2' : 'body1'}>
                  Total Cost
                </Typography>
                <Typography variant={isMobile ? 'h6' : 'h5'} component="div">
                  {formatCurrency(summary.totalCost)}
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ flex: 1 }}>
              <CardContent sx={{ py: { xs: 1.5 }, px: { xs: 2 } }}>
                <Typography color="textSecondary" gutterBottom variant={isMobile ? 'body2' : 'body1'}>
                  Total Tokens
                </Typography>
                <Typography variant={isMobile ? 'h6' : 'h5'} component="div">
                  {formatNumber(summary.totalTokens)}
                </Typography>
              </CardContent>
            </Card>
          </Stack>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2 }}>
            <Card sx={{ flex: 1 }}>
              <CardContent sx={{ py: { xs: 1.5 }, px: { xs: 2 } }}>
                <Typography color="textSecondary" gutterBottom variant={isMobile ? 'body2' : 'body1'}>
                  Prompt Tokens
                </Typography>
                <Typography variant={isMobile ? 'h6' : 'h5'} component="div">
                  {formatNumber(summary.totalPromptTokens)}
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ flex: 1 }}>
              <CardContent sx={{ py: { xs: 1.5 }, px: { xs: 2 } }}>
                <Typography color="textSecondary" gutterBottom variant={isMobile ? 'body2' : 'body1'}>
                  Completion Tokens
                </Typography>
                <Typography variant={isMobile ? 'h6' : 'h5'} component="div">
                  {formatNumber(summary.totalCompletionTokens)}
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      )}
      
      {/* Tabs for different views */}
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="ai monitoring tabs"
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : undefined}
            allowScrollButtonsMobile
            sx={{ 
              '& .MuiTab-root': { 
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                minWidth: { xs: 'auto', sm: 80 },
                px: { xs: 1, sm: 2 }
              } 
            }}
          >
            <Tab label="Overview" />
            <Tab label="Daily Usage" />
            <Tab label="Model Usage" />
            <Tab label="Records" />
          </Tabs>
        </Box>
        
        {/* Overview Tab */}
        <TabPanel value={tabValue} index={0}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2, md: 4 }}>
            {/* Daily Usage Chart */}
            <Paper sx={{ p: { xs: 1, sm: 2 }, height: { xs: 300, sm: 400 }, flex: 1 }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Daily Cost
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart
                  data={getDailyUsageData()}
                  margin={{ 
                    top: 20, 
                    right: isMobile ? 10 : 30, 
                    left: isMobile ? 0 : 20, 
                    bottom: isMobile ? 50 : 70 
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    angle={-45} 
                    textAnchor="end"
                    height={isMobile ? 50 : 70}
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                  <Bar dataKey="cost" fill="#8884d8" name="Cost ($)" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
            
            {/* Model Usage Pie Chart */}
            <Paper sx={{ p: { xs: 1, sm: 2 }, height: { xs: 300, sm: 400 }, flex: 1 }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Cost by Model
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={getModelUsageData()}
                    cx="50%"
                    cy="50%"
                    labelLine={!isMobile}
                    label={isMobile ? undefined : ({ name, percent }) => 
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={isMobile ? 60 : 80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getModelUsageData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Stack>
        </TabPanel>
        
        {/* Daily Usage Tab */}
        <TabPanel value={tabValue} index={1}>
          <Paper sx={{ p: { xs: 1, sm: 2 } }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Daily Usage Details
            </Typography>
            <TableContainer>
              <Table size={isMobile ? "small" : "medium"}>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Cost</TableCell>
                    <TableCell align="right">Tokens</TableCell>
                    <TableCell align="right">Requests</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getDailyUsageData().map((row) => (
                    <TableRow key={row.date}>
                      <TableCell component="th" scope="row" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {row.date}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {formatCurrency(row.cost)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {formatNumber(row.tokens)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {row.requests}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>
        
        {/* Model Usage Tab */}
        <TabPanel value={tabValue} index={2}>
          <Paper sx={{ p: { xs: 1, sm: 2 } }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Model Usage Details
            </Typography>
            <TableContainer>
              <Table size={isMobile ? "small" : "medium"}>
                <TableHead>
                  <TableRow>
                    <TableCell>Model</TableCell>
                    <TableCell align="right">Cost</TableCell>
                    <TableCell align="right">Tokens</TableCell>
                    <TableCell align="right">Requests</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getModelUsageData().map((row) => (
                    <TableRow key={row.name}>
                      <TableCell component="th" scope="row" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {row.name}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {formatCurrency(row.value)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {formatNumber(row.tokens)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {row.count}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>
        
        {/* Usage Records Tab */}
        <TabPanel value={tabValue} index={3}>
          <Paper sx={{ p: { xs: 1, sm: 2 } }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Recent Usage Records
            </Typography>
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table size={isMobile ? "small" : "medium"}>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Model</TableCell>
                    {!isMobile && <TableCell>Provider</TableCell>}
                    <TableCell align="right">Cost</TableCell>
                    <TableCell align="right">Tokens</TableCell>
                    {!isTablet && <TableCell>Endpoint</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {new Date(record.timestamp).toLocaleDateString()}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {record.modelId}
                      </TableCell>
                      {!isMobile && (
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {record.provider}
                        </TableCell>
                      )}
                      <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {formatCurrency(record.cost)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {formatNumber(record.usage.totalTokens)}
                      </TableCell>
                      {!isTablet && (
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {record.endpoint}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>
      </Box>
    </Container>
  );
};
