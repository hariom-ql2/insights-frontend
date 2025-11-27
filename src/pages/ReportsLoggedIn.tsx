import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Divider,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  CompareArrows,
  BarChart as BarChartIcon,
  Close as CloseIcon,
  TrendingUp,
  Assessment,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Line,
  LineChart,
  LabelList,
} from 'recharts';
import { reportsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface ReportItem {
  id: string;
  title: string;
  date: string;
  status: 'completed' | 'pending' | 'processing';
  description: string;
  metrics: {
    label: string;
    value: string;
  }[];
  chartData?: any[];
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'composed';
  category?: string;
  imagePath?: string;
}

interface ReportCategory {
  icon: React.ReactElement;
  iconBg: string;
  title: string;
  description: string;
  report: ReportItem;
}

// Dashboard report IDs that use Tableau
const TABLEAU_REPORT_IDS = ['1', '2', '3', '4'];

const ReportsLoggedIn: React.FC = () => {
  const { token } = useAuth();
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [dashboardToken, setDashboardToken] = useState<string | null>(null);
  const [dashboardURL, setDashboardURL] = useState<string | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  const reportCategories: ReportCategory[] = [
    {
      icon: <CompareArrows sx={{ fontSize: 36, color: '#FFFFFF' }} />,
      iconBg: '#6818A5',
      title: 'Competitor Rate Tracker',
      description: 'Track and compare minimum nightly rates with up to 7 selected competitors.',
      report: {
        id: '1',
        title: 'Competitor Rate Tracker',
        date: '2025-11-14',
        status: 'completed',
        description: '',
        metrics: [],
        chartData: [
          { name: '1', competitor1: 497.4, competitor2: 374.5, competitor3: 186.5 },
          { name: '2', competitor1: 530.9, competitor2: 398.5, competitor3: 166.8 },
          { name: '3', competitor1: 514.2, competitor2: 288.5, competitor3: 166.8 },
          { name: '4', competitor1: 514.2, competitor2: 288.5, competitor3: 186.5 },
        ],
        chartType: 'composed',
      },
    },
    {
      icon: <BarChartIcon sx={{ fontSize: 36, color: '#FFFFFF' }} />,
      iconBg: '#6818A5',
      title: 'Market View',
      description: 'Analysis of top budget hotels filtered by star rating with max and min nightly rates.',
      report: {
        id: '2',
        title: 'Market View: Top Budget Hotels',
        date: '2025-11-14',
        status: 'completed',
        description: '',
        metrics: [],
        chartData: [
          { name: 'Aloft Dubai', minNightly: 381.2, maxNightly: 399 },
          { name: 'Anantara Mirage', minNightly: 313.1, maxNightly: 1818 },
          { name: 'Dubai Marriott', minNightly: 406.5, maxNightly: 819 },
          { name: 'Gevora Hotel', minNightly: 227.6, maxNightly: 1478 },
          { name: 'Grand Excelsior', minNightly: 223.0, maxNightly: 447 },
          { name: 'Hilton Garden Inn ', minNightly: 326.7, maxNightly: 422 },
        ],
        chartType: 'composed',
      },
    },
    {
      icon: <TrendingUp sx={{ fontSize: 36, color: '#FFFFFF' }} />,
      iconBg: '#6818A5',
      title: 'Star Rating Trend',
      description: 'Analysis of star rating trends and patterns across hotels over time.',
      report: {
        id: '3',
        title: 'Star Rating Trend',
        date: '2025-11-10',
        status: 'completed',
        description: 'Comprehensive analysis of star rating trends showing patterns and changes in hotel ratings over time.',
        metrics: [],
        chartData: [
          { name: '57.5', rating5: 178.7, rating4: 91.9, rating3: 73.5 },
          { name: '59.8', rating5: 188.5, rating4: 107.8, rating3: 85.8 },
          { name: '60', rating5: 118.1, rating4: 94.2, rating3: 85.8 },
          { name: '61', rating5: 118.1, rating4: 107.1, rating3: 85.8 },
          { name: '62', rating5: 118.1, rating4: 85.8, rating3: 59.8 },
          { name: '63', rating5: 118.1, rating4: 74.5, rating3: 59.8 },
        ],
        chartType: 'composed',
      },
    },
    {
      icon: <Assessment sx={{ fontSize: 36, color: '#FFFFFF' }} />,
      iconBg: '#6818A5',
      title: 'Price Suggestion',
      description: 'My Hotel Nightly Rate VS Market Average Nightly Rate comparison.',
      report: {
        id: '4',
        title: 'Price Suggestion',
        date: '2025-11-12',
        status: 'completed',
        description: 'Comparison of your hotel nightly rate against market average to optimize pricing strategy.',
        metrics: [],
        chartData: [
          { name: '1', myHotel: 272.00, marketAvg: 242.50 },
          { name: '2', myHotel: 217.54, marketAvg: 190.24 },
          { name: '3', myHotel: 200.14, marketAvg: 195.79 },
          { name: '4', myHotel: 236.50, marketAvg: 195.79 },
        ],
        chartType: 'composed',
      },
    },
  ];

  // Map report IDs to API functions
  const reportApiMap = useMemo(() => ({
    '1': reportsApi.getCompetitorRateTracker,
    '2': reportsApi.getMarketView,
    '3': reportsApi.getStarRatingTrend,
    '4': reportsApi.getPriceSuggestion,
  }), []);

  const fetchDashboardData = useCallback(async (reportId: string) => {
    if (!token) {
      setDashboardToken(null);
      setDashboardURL(null);
      setLoadingDashboard(false);
      return;
    }
    
    setLoadingDashboard(true);
    setDashboardToken(null);
    setDashboardURL(null);
    
    try {
      const apiFunction = reportApiMap[reportId as keyof typeof reportApiMap];
      if (!apiFunction) {
        setDashboardToken(null);
        setDashboardURL(null);
        setLoadingDashboard(false);
        return;
      }

      const response = await apiFunction(token);

      if (response.success && response.token && response.url) {
        console.log('Successfully fetched dashboard data for report', reportId);
        setDashboardToken(response.token);
        setDashboardURL(response.url);
      } else {
        console.error('Failed to fetch dashboard for report', reportId, ':', response.message || 'No token/URL received');
        setDashboardToken(null);
        setDashboardURL(null);
      }
    } catch (error) {
      console.error('Error fetching dashboard for report', reportId, ':', error);
      setDashboardToken(null);
      setDashboardURL(null);
    } finally {
      setLoadingDashboard(false);
    }
  }, [token, reportApiMap]);

  const handleReportClick = useCallback((report: ReportItem) => {
    setSelectedReport(report);
    setModalOpen(true);
    setDashboardToken(null);
    setDashboardURL(null);
    setLoadingDashboard(false);
    
    // Fetch dashboard data for reports that use tableau
    if (TABLEAU_REPORT_IDS.includes(report.id)) {
      fetchDashboardData(report.id);
    }
  }, [fetchDashboardData]);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedReport(null);
    setDashboardToken(null);
    setDashboardURL(null);
  }, []);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && modalOpen) {
        handleCloseModal();
      }
    };

    if (modalOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [modalOpen, handleCloseModal]);

  // Create tableau-viz element when token and URL are available
  useEffect(() => {
    if (!modalOpen || !selectedReport || !TABLEAU_REPORT_IDS.includes(selectedReport.id)) {
      return;
    }

    if (dashboardToken && dashboardURL) {
      const containerId = `tableau-container-${selectedReport.id}`;
      const container = document.getElementById(containerId);
      
      if (container) {
        // Clear any existing content
        container.innerHTML = '';

        // Create tableau-viz element
        const viz = document.createElement('tableau-viz');
        viz.setAttribute('src', dashboardURL);
        viz.setAttribute('token', dashboardToken);
        viz.setAttribute('hide-tabs', 'true');
        viz.style.width = '100%';
        viz.style.height = '100%';

        // Add event listeners for debugging
        viz.addEventListener('firstinteractive', () => {
          console.log('✅ Tableau viz loaded successfully!');
          setLoadingDashboard(false);
        });

        viz.addEventListener('error', (event: any) => {
          console.error('Tableau viz error:', event);
          setLoadingDashboard(false);
        });

        container.appendChild(viz);
      }
    }

    // Cleanup function
    return () => {
      if (selectedReport) {
        const containerId = `tableau-container-${selectedReport.id}`;
        const container = document.getElementById(containerId);
        if (container) {
          container.innerHTML = '';
        }
      }
    };
  }, [modalOpen, selectedReport, dashboardToken, dashboardURL]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#10B981';
      case 'processing':
        return '#F59E0B';
      case 'pending':
        return '#64748B';
      default:
        return '#64748B';
    }
  };

  // Render chart preview for cards
  const renderChartPreview = useCallback((report: ReportItem, isPreview: boolean = true) => {
    if (!report.chartData || !report.chartData.length || !report.chartType) {
      return null;
    }

    const chartHeight = isPreview ? 200 : 550;
    const margin = isPreview ? { top: 10, right: 10, left: 10, bottom: 10 } : { top: 20, right: 30, left: 60, bottom: 60 };

    // Market View - Bar and Line Chart (Light purple bars, Blue line)
    if (report.id === '2') {
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <ComposedChart data={report.chartData} margin={margin}>
            <XAxis 
              dataKey="name"
              style={{ fontFamily: '"Urbanist", sans-serif', fontWeight: 600 }}
              tick={{ fill: '#1E293B', fontSize: isPreview ? 9 : 12 }}
              axisLine={{ stroke: '#1E293B', strokeWidth: 1 }}
              tickLine={{ stroke: '#1E293B' }}
              angle={isPreview ? -45 : 0}
              textAnchor={isPreview ? 'end' : 'middle'}
              height={isPreview ? 60 : 40}
            />
            <YAxis 
              style={{ fontFamily: '"Urbanist", sans-serif', fontWeight: 600 }}
              tick={{ fill: '#1E293B', fontSize: isPreview ? 10 : 13 }}
              axisLine={{ stroke: '#1E293B', strokeWidth: 1 }}
              tickLine={{ stroke: '#1E293B' }}
              width={isPreview ? 40 : 60}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E5E5',
                borderRadius: 8,
                fontFamily: '"Urbanist", sans-serif',
              }}
            />
            <Bar 
              dataKey="minNightly" 
              fill="#A78BFA" 
              radius={[4, 4, 0, 0]}
            >
              <LabelList 
                dataKey="minNightly" 
                position="bottom" 
                style={{ 
                  fill: '#1E293B', 
                  fontSize: isPreview ? 9 : 11,
                  fontFamily: '"Urbanist", sans-serif',
                  fontWeight: 600 
                }}
                formatter={(value: number) => value.toFixed(1)}
              />
            </Bar>
            <Line 
              type="monotone" 
              dataKey="maxNightly" 
              stroke="#3B82F6" 
              strokeWidth={3} 
              dot={{ r: 5, fill: '#3B82F6', strokeWidth: 2, stroke: '#FFFFFF' }} 
              activeDot={{ r: 7 }}
              isAnimationActive={false}
            >
              <LabelList 
                dataKey="maxNightly" 
                position="top" 
                style={{ 
                  fill: '#3B82F6', 
                  fontSize: isPreview ? 9 : 11,
                  fontFamily: '"Urbanist", sans-serif',
                  fontWeight: 600 
                }}
                formatter={(value: number) => value.toLocaleString()}
              />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      );
    }

    // Star Rating Trend - Multi-line Chart
    if (report.id === '3') {
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart data={report.chartData} margin={margin}>
            <XAxis 
              dataKey="name"
              style={{ fontFamily: '"Urbanist", sans-serif', fontWeight: 600 }}
              tick={{ fill: '#1E293B', fontSize: isPreview ? 10 : 13 }}
              axisLine={{ stroke: '#1E293B', strokeWidth: 1 }}
              tickLine={{ stroke: '#1E293B' }}
            />
            <YAxis 
              style={{ fontFamily: '"Urbanist", sans-serif', fontWeight: 600 }}
              tick={{ fill: '#1E293B', fontSize: isPreview ? 10 : 13 }}
              axisLine={{ stroke: '#1E293B', strokeWidth: 1 }}
              tickLine={{ stroke: '#1E293B' }}
              width={isPreview ? 40 : 60}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E5E5',
                borderRadius: 8,
                fontFamily: '"Urbanist", sans-serif',
              }}
            />
            <Line type="monotone" dataKey="rating5" stroke="#60A5FA" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="rating4" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="rating3" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // Competitor Rate Tracker - Multi-line Chart
    if (report.id === '1') {
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart data={report.chartData} margin={margin}>
            <XAxis 
              dataKey="name"
              style={{ fontFamily: '"Urbanist", sans-serif', fontWeight: 600 }}
              tick={{ fill: '#1E293B', fontSize: isPreview ? 10 : 13 }}
              axisLine={{ stroke: '#1E293B', strokeWidth: 1 }}
              tickLine={{ stroke: '#1E293B' }}
            />
            <YAxis 
              style={{ fontFamily: '"Urbanist", sans-serif', fontWeight: 600 }}
              tick={{ fill: '#1E293B', fontSize: isPreview ? 10 : 13 }}
              axisLine={{ stroke: '#1E293B', strokeWidth: 1 }}
              tickLine={{ stroke: '#1E293B' }}
              width={isPreview ? 40 : 60}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E5E5',
                borderRadius: 8,
                fontFamily: '"Urbanist", sans-serif',
              }}
            />
            <Line type="monotone" dataKey="competitor1" stroke="#6818A5" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="competitor2" stroke="#60A5FA" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="competitor3" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // Price Suggestion - Dual Line Chart
    if (report.id === '4') {
      return (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart data={report.chartData} margin={margin}>
            <XAxis 
              dataKey="name"
              style={{ fontFamily: '"Urbanist", sans-serif', fontWeight: 600 }}
              tick={{ fill: '#1E293B', fontSize: isPreview ? 10 : 13 }}
              axisLine={{ stroke: '#1E293B', strokeWidth: 1 }}
              tickLine={{ stroke: '#1E293B' }}
            />
            <YAxis 
              style={{ fontFamily: '"Urbanist", sans-serif', fontWeight: 600 }}
              tick={{ fill: '#1E293B', fontSize: isPreview ? 10 : 13 }}
              axisLine={{ stroke: '#1E293B', strokeWidth: 1 }}
              tickLine={{ stroke: '#1E293B' }}
              width={isPreview ? 40 : 60}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E5E5',
                borderRadius: 8,
                fontFamily: '"Urbanist", sans-serif',
              }}
            />
            <Line type="monotone" dataKey="myHotel" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="marketAvg" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    return null;
  }, []);

  // Render chart for modal (full size)
  const renderChart = useCallback((report: ReportItem) => {
    if (!report.chartData || !report.chartData.length || !report.chartType) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography sx={{ color: '#64748B' }}>No chart data available</Typography>
        </Box>
      );
    }

    return renderChartPreview(report, false);
  }, [renderChartPreview]);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 800, 
            color: '#6818A5', 
            mb: 1, 
            fontFamily: '"Urbanist", sans-serif' 
          }}
        >
          Reports
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: '#1E293B', 
            fontWeight: 600, 
            fontFamily: '"Urbanist", sans-serif' 
          }}
        >
          Access comprehensive reports and analytics to gain insights into hotel prices, reviews, availability, and performance metrics.
        </Typography>
      </Box>

      {/* Reports Grid - 2x2 layout */}
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 3,
          width: '100%',
        }}
      >
        {reportCategories.map((category, categoryIndex) => (
          <Card
            key={categoryIndex}
            onClick={() => handleReportClick(category.report)}
            sx={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              borderRadius: 2,
              border: '1px solid #E5E5E5',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '450px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: '#6818A5',
                boxShadow: '0 8px 24px rgba(104, 24, 165, 0.2)',
                transform: 'translateY(-4px)',
              },
            }}
          >
            <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Category Header */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2.5 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    background: category.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                    flexShrink: 0,
                  }}
                >
                  {category.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: '#0F172A',
                      fontWeight: 800,
                      fontFamily: '"Urbanist", sans-serif',
                      fontSize: '1.1rem',
                      mb: 0.5,
                    }}
                  >
                    {category.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#64748B',
                      fontWeight: 500,
                      fontFamily: '"Urbanist", sans-serif',
                      fontSize: '0.875rem',
                      lineHeight: 1.5,
                    }}
                  >
                    {category.description}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2.5 }} />

              {/* Chart Preview */}
              {category.report.chartData && category.report.chartData.length > 0 && (
                <Box 
                  sx={{ 
                    flex: 1, 
                    minHeight: '220px',
                    mb: 2,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 1,
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {renderChartPreview(category.report, true)}
                </Box>
              )}

              {/* Report Preview */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                  {category.report.metrics.slice(0, 2).map((metric, idx) => (
                    <Chip
                      key={idx}
                      label={`${metric.label}: ${metric.value}`}
                      size="small"
                      sx={{
                        backgroundColor: '#F7F4FD',
                        color: '#6818A5',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: 24,
                      }}
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#64748B',
                      fontWeight: 600,
                      fontFamily: '"Urbanist", sans-serif',
                    }}
                  >
                    {new Date(category.report.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Typography>
                  <Chip
                    label={category.report.status}
                    size="small"
                    sx={{
                      backgroundColor: getStatusColor(category.report.status),
                      color: '#FFFFFF',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      height: 22,
                      textTransform: 'capitalize',
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Report Detail Modal - Fullscreen with Sidebar */}
      {modalOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: { md: '280px', xs: 0 },
            right: 0,
            bottom: 0,
            width: { md: 'calc(100% - 280px)', xs: '100%' },
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 1300,
            display: 'flex',
            flexDirection: 'column',
          }}
          onClick={handleCloseModal}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              width: '100%',
              height: '100%',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
        {selectedReport && (
          <>
            {/* Close Button - Top Right */}
            <IconButton
              onClick={handleCloseModal}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 10,
                color: '#FFFFFF',
                backgroundColor: '#6818A5',
                borderRadius: '50%',
                width: 40,
                height: 40,
                '&:hover': {
                  backgroundColor: '#5a1594',
                  color: '#FFFFFF',
                },
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              <CloseIcon />
            </IconButton>

            {/* Dashboard Tableau Section - For reports with tableau - Fullscreen */}
            {TABLEAU_REPORT_IDS.includes(selectedReport.id) && (
              <Box 
                sx={{ 
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'stretch',
                  overflow: 'hidden',
                  minHeight: 0,
                  position: 'relative',
                }}
              >
                {loadingDashboard ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                    <CircularProgress sx={{ color: '#6818A5' }} />
                  </Box>
                ) : dashboardToken && dashboardURL ? (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      flex: 1,
                      overflow: 'hidden',
                      backgroundColor: '#FFFFFF',
                      display: 'flex',
                      minHeight: 0,
                    }}
                    id={`tableau-container-${selectedReport.id}`}
                  >
                    {/* tableau-viz web component will be inserted here */}
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', p: 3 }}>
                    <Typography sx={{ color: '#64748B', fontWeight: 600, fontFamily: '"Urbanist", sans-serif', mb: 1 }}>
                      Unable to load report
                    </Typography>
                    <Typography sx={{ color: '#94A3B8', fontSize: '0.875rem', fontFamily: '"Urbanist", sans-serif', textAlign: 'center' }}>
                      The report content could not be loaded. Please try again later.
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Chart Section - For non-tableau reports */}
            {!TABLEAU_REPORT_IDS.includes(selectedReport.id) && selectedReport.chartData && selectedReport.chartData.length > 0 && selectedReport.chartType && (
              <Box 
                sx={{ 
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'auto',
                  p: 3,
                }}
              >
                <Card
                  sx={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E5E5',
                    borderRadius: 2,
                    p: 2.5,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: '#0F172A',
                      fontFamily: '"Urbanist", sans-serif',
                      mb: 2,
                      fontSize: '1rem',
                    }}
                  >
                    Visual Analytics
                  </Typography>
                  <Box 
                    sx={{ 
                      width: '100%', 
                      height: '550px', 
                      minHeight: '550px',
                      maxHeight: '550px',
                      flexShrink: 0, 
                      position: 'relative',
                      display: 'block',
                    }}
                  >
                    {renderChart(selectedReport)}
                  </Box>
                </Card>
              </Box>
            )}
          </>
        )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ReportsLoggedIn;
