'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Container,
  ThemeProvider,
  createTheme,
  Avatar,
  Stack,
  Chip,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemIcon,
  Button,
  Badge,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

import {
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  Inventory as InventoryIcon,
  Assessment as AssessmentIcon,
  Dashboard as DashboardIcon,
  Apps as AppsIcon,
  Phone as PhoneIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Notifications as NotificationsIcon,
  Speed as SpeedIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Visibility as VisibilityIcon,
  Star as StarIcon,
  TrendingDown as TrendingDownIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Business as BusinessIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { useAuth } from '../../lib/auth-context';
import Header from '../../components/Header';
import ProductsTab from '../../components/ProductsTab';
import GrowTab from '../../components/GrowTab';
import TrainingsTab from '../../components/TrainingsTab';
import BannersTab from '../../components/BannersTab';
import LeadsManagement from './manage/leads';

// Placeholder components for Analytics and Settings
const AnalyticsManagement = () => (
  <Box>
    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
      Analytics & Reports
    </Typography>
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <CardContent sx={{ p: 4 }}>
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          Analytics and reporting features are coming soon!
        </Alert>
        <Typography variant="body1" color="textSecondary">
          This section will provide lead conversion analytics, performance metrics, and user engagement reports.
        </Typography>
      </CardContent>
    </Card>
  </Box>
);

const SettingsManagement = () => (
  <Box>
    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
      App Settings & Configuration
    </Typography>
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <CardContent sx={{ p: 4 }}>
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          Settings management features are coming soon!
        </Alert>
        <Typography variant="body1" color="textSecondary">
          This section will allow you to configure system settings, manage user permissions, and set up integrations.
        </Typography>
      </CardContent>
    </Card>
  </Box>
);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
}

interface DashboardStats {
  totalLeads: number;
  pendingLeads: number;
  contactedLeads: number;
  appliedLeads: number;
  rejectedLeads: number;
  totalProducts: number;
  recentLeads: Array<{
    id: string;
    user_name: string;
    product_name: string;
    status: string;
    created_at: string;
  }>;
  leadsByDate: Array<{ date: string; count: number }>;
}

export default function AdminDashboard() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Dark mode state
  const [darkMode, setDarkMode] = useState(false);
  
  // Date range state
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: { main: '#2563eb' }, // blue-600
          secondary: { main: '#a21caf' }, // purple-700
        },
        typography: {
          fontFamily: [
            'Inter',
            'Roboto',
            'Helvetica',
            'Arial',
            'sans-serif',
          ].join(','),
        },
      }),
    [darkMode]
  );

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all leads data
      const allLeadsResponse = await fetch('/api/shared-products/leads?page=1&limit=1000');
      const allLeadsData = await allLeadsResponse.json();
      
      // Fetch recent leads
      const recentLeadsResponse = await fetch('/api/shared-products/leads?page=1&limit=5');
      const recentLeadsData = await recentLeadsResponse.json();
      
      const leads = allLeadsData.leads || [];
      
      // Calculate leads by date for the selected range
      const leadsByDate = calculateLeadsByDate(leads, startDate, endDate);
      
      const stats: DashboardStats = {
        totalLeads: leads.length,
        pendingLeads: leads.filter((lead: any) => lead.status === 'pending').length,
        contactedLeads: leads.filter((lead: any) => lead.status === 'contacted').length,
        appliedLeads: leads.filter((lead: any) => lead.status === 'applied').length,
        rejectedLeads: leads.filter((lead: any) => lead.status === 'rejected').length,
        totalProducts: 0, // Will be implemented when products API is ready
        recentLeads: recentLeadsData.leads.slice(0, 5),
        leadsByDate
      };
      
      setStats(stats);
    } catch (err) {
      setError('Failed to fetch dashboard statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateLeadsByDate = (leads: any[], start: string, end: string) => {
    const dateCounts: { [key: string]: number } = {};
    
    leads.forEach((lead) => {
      const leadDate = new Date(lead.created_at).toISOString().split('T')[0];
      
      // Filter by date range if provided
      if (start && end) {
        if (leadDate >= start && leadDate <= end) {
          dateCounts[leadDate] = (dateCounts[leadDate] || 0) + 1;
        }
      } else {
        // If no date range, show last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const leadDateObj = new Date(leadDate);
        
        if (leadDateObj >= thirtyDaysAgo) {
          dateCounts[leadDate] = (dateCounts[leadDate] || 0) + 1;
        }
      }
    });
    
    // Convert to array and sort by date
    return Object.entries(dateCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  // Store all leads data to avoid refetching
  const [allLeadsData, setAllLeadsData] = useState<any[]>([]);

  const fetchAllLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const allLeadsResponse = await fetch('/api/shared-products/leads?page=1&limit=1000');
      const allLeadsData = await allLeadsResponse.json();
      setAllLeadsData(allLeadsData.leads || []);
    } catch (err) {
      console.error('Failed to fetch leads data:', err);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const updateDashboardStats = useMemo(() => {
    if (allLeadsData.length === 0) return null;
    
    const leadsByDate = calculateLeadsByDate(allLeadsData, startDate, endDate);
    
    return {
      totalLeads: allLeadsData.length,
      pendingLeads: allLeadsData.filter((lead: any) => lead.status === 'pending').length,
      contactedLeads: allLeadsData.filter((lead: any) => lead.status === 'contacted').length,
      appliedLeads: allLeadsData.filter((lead: any) => lead.status === 'applied').length,
      rejectedLeads: allLeadsData.filter((lead: any) => lead.status === 'rejected').length,
      totalProducts: 0,
      recentLeads: allLeadsData.slice(0, 5),
      leadsByDate
    };
  }, [allLeadsData, startDate, endDate]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchAllLeads();
      
      // Fallback to stop loading if it takes too long
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 10000); // 10 seconds timeout
      
      return () => clearTimeout(timeout);
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    if (updateDashboardStats) {
      setStats(updateDashboardStats);
      setLoading(false); // Ensure loading is false when stats are updated
    }
  }, [updateDashboardStats]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'manage-products':
        setTabValue(1); // Switch to Products tab
        break;
      case 'view-leads':
        setTabValue(5); // Switch to Leads Management tab
        break;
      case 'manage-banners':
        setTabValue(4); // Switch to Banners tab
        break;
      case 'configure-settings':
        setTabValue(7); // Switch to Settings tab
        break;
      case 'view-analytics':
        setTabValue(6); // Switch to Analytics tab
        break;
      default:
        break;
    }
  };

  // Check if user is authenticated and is admin
  if (!isAuthenticated) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          Please log in to access the admin dashboard.
        </Alert>
      </Container>
    );
  }

  if (!isAdmin) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Access denied. Admin privileges required to view this page.
        </Alert>
      </Container>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return { bg: '#FFF3E0', color: '#E65100', border: '#FFB74D' };
      case 'contacted': return { bg: '#E3F2FD', color: '#1565C0', border: '#64B5F6' };
      case 'applied': return { bg: '#E8F5E8', color: '#2E7D32', border: '#81C784' };
      case 'rejected': return { bg: '#FFEBEE', color: '#C62828', border: '#E57373' };
      default: return { bg: '#F5F5F5', color: '#757575', border: '#BDBDBD' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AssignmentIcon sx={{ fontSize: 16 }} />;
      case 'contacted': return <PhoneIcon sx={{ fontSize: 16 }} />;
      case 'applied': return <CheckCircleIcon sx={{ fontSize: 16 }} />;
      case 'rejected': return <CancelIcon sx={{ fontSize: 16 }} />;
      default: return <AssignmentIcon sx={{ fontSize: 16 }} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StatCard = ({ title, value, icon, color, gradient }: { 
    title: string; 
    value: number; 
    icon: React.ReactNode; 
    color: string;
    gradient: string;
  }) => (
    <Card sx={{ 
      height: '100%',
      background: gradient,
      color: 'white',
      borderRadius: 3,
      boxShadow: `0 8px 32px ${color}40`,
      transition: 'transform 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 12px 40px ${color}60`,
      }
    }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="rgba(255,255,255,0.8)" gutterBottom variant="h6" sx={{ fontWeight: 500 }}>
              {title}
            </Typography>
            <Typography variant="h3" component="div" sx={{ fontWeight: 700, mb: 1 }}>
              {value.toLocaleString()}
            </Typography>
          </Box>
          <Avatar sx={{ 
            bgcolor: 'rgba(255,255,255,0.2)', 
            width: 64, 
            height: 64,
            backdropFilter: 'blur(10px)'
          }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  // Line Chart Component with Real Data
  const LineChart = ({ data, title }: { data: Array<{ date: string; count: number }>; title: string }) => {
    if (data.length === 0) {
      return (
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              {title}
            </Typography>
            <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color="text.secondary">No data available for selected date range</Typography>
            </Box>
          </CardContent>
        </Card>
      );
    }

    const maxValue = Math.max(...data.map(d => d.count));
    const points = data.map((item, index) => ({
      x: (index / (data.length - 1)) * 100,
      y: maxValue > 0 ? 100 - ((item.count / maxValue) * 100) : 50
    }));
    
    const pathData = points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x}% ${point.y}%`
    ).join(' ');
    
    return (
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            {title}
          </Typography>
          <Box sx={{ height: 200, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <svg width="100%" height="100%" style={{ position: 'absolute' }}>
              <path
                d={pathData}
                stroke="#2196F3"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {points.map((point, index) => (
                <circle
                  key={index}
                  cx={`${point.x}%`}
                  cy={`${point.y}%`}
                  r="4"
                  fill="#2196F3"
                  stroke="white"
                  strokeWidth="2"
                />
              ))}
            </svg>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mt: 'auto', pt: 2 }}>
              {data.map((item, index) => (
                <Typography key={index} variant="caption" color="text.secondary">
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Typography>
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const DashboardOverview = () => (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ 
        fontWeight: 700, 
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        mb: 1
      }}>
        Dashboard Overview
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome to your admin dashboard. Monitor leads, track performance, and manage your business efficiently.
      </Typography>
      
      {loading ? (
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress size={60} />
          </Box>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      ) : stats ? (
        <>
          {/* Date Range Selector */}
          <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Select Date Range
              </Typography>
              <Box 
                component="form"
                sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}
                onSubmit={(e) => e.preventDefault()}
                noValidate
              >
                <TextField
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    e.preventDefault();
                    setStartDate(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 200 }}
                />
                <TextField
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    e.preventDefault();
                    setEndDate(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 200 }}
                />
                <Button
                  variant="outlined"
                  onClick={(e) => {
                    e.preventDefault();
                    setStartDate('');
                    setEndDate('');
                  }}
                  sx={{ minWidth: 120 }}
                >
                  Reset
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }, gap: 3, mb: 4 }}>
            <StatCard
              title="Total Leads"
              value={stats.totalLeads}
              icon={<PeopleIcon sx={{ fontSize: 32 }} />}
              color="#667eea"
              gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            />
            <StatCard
              title="Pending"
              value={stats.pendingLeads}
              icon={<AssignmentIcon sx={{ fontSize: 32 }} />}
              color="#f093fb"
              gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            />
            <StatCard
              title="Contacted"
              value={stats.contactedLeads}
              icon={<PhoneIcon sx={{ fontSize: 32 }} />}
              color="#4facfe"
              gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
            />
            <StatCard
              title="Applied"
              value={stats.appliedLeads}
              icon={<CheckCircleIcon sx={{ fontSize: 32 }} />}
              color="#43e97b"
              gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
            />
            <StatCard
              title="Rejected"
              value={stats.rejectedLeads}
              icon={<CancelIcon sx={{ fontSize: 32 }} />}
              color="#c62828"
              gradient="linear-gradient(135deg, #c62828 0%, #e57373 100%)"
            />
          </Box>

          {/* Content Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
            <Box>
              <Stack spacing={3}>
                {/* Line Chart */}
                <LineChart
                  data={stats.leadsByDate}
                  title="Leads Over Time"
                />
                
                {/* Recent Leads */}
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                      Recent Leads
                    </Typography>
                    {stats.recentLeads.length > 0 ? (
                      <Stack spacing={2}>
                        {stats.recentLeads.map((lead) => {
                          const statusColors = getStatusColor(lead.status);
                          return (
                            <Box
                              key={lead.id}
                              sx={{
                                p: 2,
                                border: '1px solid #e0e0e0',
                                borderRadius: 2,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                  borderColor: '#2196F3',
                                  boxShadow: '0 2px 8px rgba(33, 150, 243, 0.1)',
                                }
                              }}
                            >
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                                  {lead.user_name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  {lead.product_name}
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <CalendarIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="caption" color="text.secondary">
                                    {formatDate(lead.created_at)}
                                  </Typography>
                                </Stack>
                              </Box>
                              <Chip
                                icon={getStatusIcon(lead.status)}
                                label={lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                                sx={{
                                  backgroundColor: statusColors.bg,
                                  color: statusColors.color,
                                  border: `1px solid ${statusColors.border}`,
                                  fontWeight: 600,
                                  borderRadius: 2,
                                  '& .MuiChip-icon': {
                                    color: statusColors.color,
                                  }
                                }}
                                size="small"
                              />
                            </Box>
                          );
                        })}
                      </Stack>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography color="textSecondary">
                          No recent leads found
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Stack>
            </Box>
            
            <Box>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                    Quick Actions
                  </Typography>
                  <Stack spacing={2}>
                    <Button
                      variant="outlined"
                      startIcon={<InventoryIcon />}
                      fullWidth
                      onClick={() => handleQuickAction('manage-products')}
                      sx={{
                        justifyContent: 'flex-start',
                        py: 1.5,
                        borderRadius: 2,
                        borderColor: '#e0e0e0',
                        '&:hover': {
                          borderColor: '#2196F3',
                          bgcolor: '#e3f2fd'
                        }
                      }}
                    >
                      Manage Products
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<PeopleIcon />}
                      fullWidth
                      onClick={() => handleQuickAction('view-leads')}
                      sx={{
                        justifyContent: 'flex-start',
                        py: 1.5,
                        borderRadius: 2,
                        borderColor: '#e0e0e0',
                        '&:hover': {
                          borderColor: '#4caf50',
                          bgcolor: '#e8f5e8'
                        }
                      }}
                    >
                      View All Leads
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<ImageIcon />}
                      fullWidth
                      onClick={() => handleQuickAction('manage-banners')}
                      sx={{
                        justifyContent: 'flex-start',
                        py: 1.5,
                        borderRadius: 2,
                        borderColor: '#e0e0e0',
                        '&:hover': {
                          borderColor: '#e91e63',
                          bgcolor: '#fce4ec'
                        }
                      }}
                    >
                      Manage Banners
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<AnalyticsIcon />}
                      fullWidth
                      onClick={() => handleQuickAction('view-analytics')}
                      sx={{
                        justifyContent: 'flex-start',
                        py: 1.5,
                        borderRadius: 2,
                        borderColor: '#e0e0e0',
                        '&:hover': {
                          borderColor: '#ff9800',
                          bgcolor: '#fff3e0'
                        }
                      }}
                    >
                      View Analytics
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<SettingsIcon />}
                      fullWidth
                      onClick={() => handleQuickAction('configure-settings')}
                      sx={{
                        justifyContent: 'flex-start',
                        py: 1.5,
                        borderRadius: 2,
                        borderColor: '#e0e0e0',
                        '&:hover': {
                          borderColor: '#9c27b0',
                          bgcolor: '#f3e5f5'
                        }
                      }}
                    >
                      Configure Settings
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </>
      ) : null}
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <Header darkMode={darkMode} onToggleDarkMode={() => setDarkMode((prev) => !prev)} />
      <Box sx={{ width: '100%', bgcolor: 'background.default', px: 2 }}>
        <Paper sx={{ 
          width: '100%', 
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden'
        }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="admin navigation tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              bgcolor: '#f8f9fa',
              '& .MuiTab-root': {
                minHeight: 64,
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'none',
                '&.Mui-selected': {
                  color: '#2196F3',
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#2196F3',
                height: 3,
              }
            }}
          >
            <Tab
              label="Dashboard"
              icon={<DashboardIcon />}
              iconPosition="start"
              {...a11yProps(0)}
            />
            <Tab
              label="Products"
              icon={<InventoryIcon />}
              iconPosition="start"
              {...a11yProps(1)}
            />
            <Tab
              label="Grow"
              icon={<TrendingUpIcon />}
              iconPosition="start"
              {...a11yProps(2)}
            />
            <Tab
              label="Training"
              icon={<AssessmentIcon />}
              iconPosition="start"
              {...a11yProps(3)}
            />
            <Tab
              label="Banners"
              icon={<ImageIcon />}
              iconPosition="start"
              {...a11yProps(4)}
            />
            <Tab
              label="Leads Management"
              icon={<PeopleIcon />}
              iconPosition="start"
              {...a11yProps(5)}
            />
            <Tab
              label="Analytics"
              icon={<AssessmentIcon />}
              iconPosition="start"
              {...a11yProps(6)}
            />
            <Tab
              label="Settings"
              icon={<AppsIcon />}
              iconPosition="start"
              {...a11yProps(7)}
            />
          </Tabs>
          
          <TabPanel value={tabValue} index={0}>
            <DashboardOverview />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <ProductsTab />
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <GrowTab />
          </TabPanel>
          
          <TabPanel value={tabValue} index={3}>
            <TrainingsTab />
          </TabPanel>
          
          <TabPanel value={tabValue} index={4}>
            <BannersTab />
          </TabPanel>
          
          <TabPanel value={tabValue} index={5}>
            <LeadsManagement />
          </TabPanel>
          
          <TabPanel value={tabValue} index={6}>
            <AnalyticsManagement />
          </TabPanel>
          
          <TabPanel value={tabValue} index={7}>
            <SettingsManagement />
          </TabPanel>
        </Paper>
      </Box>
    </ThemeProvider>
  );
} 