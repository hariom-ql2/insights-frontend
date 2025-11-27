import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Chip,
  Link,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboardApi, apiService, schedulesApi } from '../services/api';
import AddIcon from '@mui/icons-material/Add';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import TimeDisplay from '../components/TimeDisplay';
import noResultsImage from '../../icons/no-results.png';

interface UpcomingSchedule {
  id: number;
  name: string;
  description?: string;
  status: string;
  scheduleType?: string;
  next_run_at?: string;
  last_run_at?: string;
  collection_id?: number;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description?: string;
  timestamp: string;
  status: string;
}

interface Subscription {
  planName: string;
  price: number;
  status: string;
  totalInputs: number;
  inputsUsed: number;
  inputsLeft: number;
  balance: number;
  recentTransactions: Transaction[];
}

interface Event {
  id: number;
  title: string;
  date: string;
  endDate?: string;
  location: string;
  imageUrl: string;
  link: string;
}

interface DashboardStats {
  active: number;
  completed: number;
  scheduled: number;
  multiSiteData: {
    name: string;
    value: number;
    count?: number;
  }[];
  upcomingSchedules: UpcomingSchedule[];
  subscription: Subscription;
  events: Event[];
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    active: 0,
    completed: 0,
    scheduled: 0,
    multiSiteData: [],
    upcomingSchedules: [],
      subscription: {
        planName: 'Premium Plan',
        price: 1000,
        status: 'Active',
        totalInputs: 0,
        inputsUsed: 0,
        inputsLeft: 0,
        balance: 0,
        recentTransactions: [],
      },
      events: [
        {
          id: 1,
          title: 'Eid Al Etihad Fireworks',
          date: '2025-12-02',
          location: 'Dubai Festival City Mall',
          imageUrl: '/fireworks.jpg',
          link: 'https://www.visitdubai.com/en/festivals-and-events/dubai-events-calendar/eid-al-etihad-fireworks',
        },
        {
          id: 2,
          title: 'Sir Winston Churchill Cup',
          date: '2025-12-03',
          endDate: '2025-12-06',
          location: 'Al Habtoor Polo Resort',
          imageUrl: '/dubai-polo.jpg',
          link: 'https://www.visitdubai.com/en/festivals-and-events/dubai-events-calendar/sir-winston-churchill-cup',
        },
        {
          id: 3,
          title: 'Dubai Basketball',
          date: '2025-12-04',
          location: 'Coca-Cola Arena',
          imageUrl: '/basket-dubai.jpg',
          link: 'https://www.visitdubai.com/en/festivals-and-events/dubai-events-calendar/dubai-basketball-club',
        },
      ],
  });

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    if (!token) return;

    try {
      setLoading(true);
      
      // Fetch user's searches, collections, schedules, wallet, and dashboard stats
      const [searchesRes, collectionsRes, dashboardRes, schedulesRes, walletRes] = await Promise.all([
        apiService.get('/my-searches', token),
        apiService.get('/my-collections', token),
        dashboardApi.getStats(token),
        schedulesApi.getSchedules(token),
        apiService.get('/wallet', token),
      ]);

      const hasSearches = searchesRes.success && (searchesRes as any).searches?.length > 0;
      const hasCollections = collectionsRes.success && (collectionsRes as any).collections?.length > 0;
      
      setIsFirstTime(!hasSearches && !hasCollections);

      // Process dashboard stats
      const dashboardData = dashboardRes.success && dashboardRes.data ? dashboardRes.data : {};
      
      // Process schedules - filter for active schedules with upcoming next_run_at
      let upcomingSchedules: UpcomingSchedule[] = [];
      if (schedulesRes.success && schedulesRes.data && Array.isArray(schedulesRes.data)) {
        const now = new Date();
        const filteredSchedules = schedulesRes.data
          .filter((schedule: any) => {
            if (!schedule.is_active) return false;
            if (!schedule.next_run_at) return false;
            const nextRun = new Date(schedule.next_run_at);
            return nextRun > now;
          })
          .sort((a: any, b: any) => {
            const dateA = new Date(a.next_run_at || 0);
            const dateB = new Date(b.next_run_at || 0);
            return dateA.getTime() - dateB.getTime();
          })
          .slice(0, 2); // Limit to 2 upcoming schedules

        // Fetch collection names for schedules that have collection_id
        const collectionPromises = filteredSchedules
          .filter((s: any) => s.collection_id)
          .map((schedule: any) =>
            apiService.get(`/collection/${schedule.collection_id}`, token)
              .then((res: any) => ({ scheduleId: schedule.id, collection: res }))
              .catch(() => ({ scheduleId: schedule.id, collection: null }))
          );

        const collectionResults = await Promise.all(collectionPromises);
        const collectionMap = new Map<number, string>();
        collectionResults.forEach((result: any) => {
          if (result.collection && result.collection.success && result.collection.collection) {
            collectionMap.set(result.scheduleId, result.collection.collection.name);
          }
        });

        upcomingSchedules = filteredSchedules.map((schedule: any) => ({
          id: schedule.id,
          name: schedule.name,
          description: collectionMap.get(schedule.id) || schedule.description || 'Collection Name',
          status: schedule.is_active ? 'Active' : 'Inactive',
          scheduleType: schedule.schedule_type || schedule.scheduleType,
          next_run_at: schedule.next_run_at,
          last_run_at: schedule.last_run_at,
          collection_id: schedule.collection_id,
        }));
      }

      // Calculate subscription details from wallet and searches
      let inputsUsed = 0;
      if (searchesRes.success && (searchesRes as any).searches) {
        // Count total search items from all searches
        // We'll need to fetch search details to get item counts, but for now use a reasonable estimate
        // For MVP, we can use the number of searches as a proxy or fetch a few searches
        const searches = (searchesRes as any).searches;
        // Try to get item counts from searches if available
        if (searches.length > 0) {
          // Fetch first few searches to get item counts
          const searchDetailsPromises = searches.slice(0, 10).map((search: any) =>
            apiService.get(`/search/${search.id}`, token)
          );
          const searchDetails = await Promise.all(searchDetailsPromises);
          inputsUsed = searchDetails.reduce((total, res: any) => {
            if (res.success && res.search && res.search.search_items) {
              return total + (res.search.search_items.length || 0);
            }
            return total;
          }, 0);
          
          // If we only fetched a subset, estimate for the rest
          if (searches.length > 10) {
            const avgItemsPerSearch = inputsUsed / Math.min(10, searches.length);
            inputsUsed += Math.round(avgItemsPerSearch * (searches.length - 10));
          }
        }
      }

      // Process wallet data for subscription
      let subscription: Subscription = {
        planName: 'Plan Name',
        price: 800.67,
        status: 'Active',
        totalInputs: 10000,
        inputsUsed: isFirstTime ? 0 : inputsUsed,
        inputsLeft: 10000 - (isFirstTime ? 0 : inputsUsed),
        balance: 0,
        recentTransactions: [],
      };

      if (walletRes.success) {
        subscription.balance = walletRes.balance || 0;
        
        // Get recent transactions (2-3 most recent)
        const transactions = walletRes.transactions || [];
        subscription.recentTransactions = transactions
          .slice(0, 3)
          .map((t: any) => ({
            id: t.id,
            type: t.type,
            amount: t.amount,
            description: t.description,
            timestamp: t.timestamp,
            status: t.status,
          }));
        
        // Calculate plan price from transactions if available
        if (transactions.length > 0) {
          // Use the largest credit transaction as plan price, or calculate from total
          const creditTransactions = transactions.filter((t: any) => t.type === 'credit');
          if (creditTransactions.length > 0) {
            const totalCredits = creditTransactions.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
            subscription.price = totalCredits > 0 ? totalCredits : 800.67;
          }
        }
      }

      // Get multi-site data from dashboard stats (backend already returns sorted data)
      const multiSiteData = Array.isArray(dashboardData.multiSiteData) ? dashboardData.multiSiteData : [];
      
      // Static events data
      const eventsData = getEventsData();

      setStats({
        active: dashboardData.active || 0,
        completed: dashboardData.completed || 0,
        scheduled: dashboardData.scheduled || 0,
        multiSiteData: multiSiteData,
        upcomingSchedules: upcomingSchedules,
        subscription: subscription,
        events: eventsData,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // On error, set empty stats but keep events
      setStats({
        active: 0,
        completed: 0,
        scheduled: 0,
        multiSiteData: [],
        upcomingSchedules: [],
        subscription: {
          planName: 'Plan Name',
          price: 800.67,
          status: 'Active',
          totalInputs: 10000,
          inputsUsed: 0,
          inputsLeft: 10000,
          balance: 0,
          recentTransactions: [],
        },
        events: getEventsData(),
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function for static events data
  const getEventsData = (): Event[] => {
    return [
      {
        id: 1,
        title: 'Eid Al Etihad Fireworks',
        date: '2025-12-02',
        location: 'Dubai Festival City Mall',
        imageUrl: '/fireworks.jpg',
        link: 'https://www.visitdubai.com/en/festivals-and-events/dubai-events-calendar/eid-al-etihad-fireworks',
      },
      {
        id: 2,
        title: 'Sir Winston Churchill Cup',
        date: '2025-12-03',
        endDate: '2025-12-06',
        location: 'Al Habtoor Polo Resort',
        imageUrl: '/dubai-polo.jpg',
        link: 'https://www.visitdubai.com/en/festivals-and-events/dubai-events-calendar/sir-winston-churchill-cup',
      },
      {
        id: 3,
        title: 'Dubai Basketball',
        date: '2025-12-04',
        location: 'Coca-Cola Arena',
        imageUrl: '/basket-dubai.jpg',
        link: 'https://www.visitdubai.com/en/festivals-and-events/dubai-events-calendar',
      },
    ];
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  const formatEventDate = (date: string, endDate?: string) => {
    const start = new Date(date);
    const month = start.toLocaleString('default', { month: 'short' });
    const day = start.getDate();
    const year = start.getFullYear();
    
    if (endDate) {
      const end = new Date(endDate);
      const endDay = end.getDate();
      return `${day} ${month} - ${endDay} ${month}, ${year}`;
    }
    return `${day} ${month}, ${year}`;
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: 1, minWidth: '300px' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#6818A5', mb: 1, fontFamily: '"Urbanist", sans-serif' }}>
            Overview
          </Typography>
          <Typography variant="body1" sx={{ color: '#1E293B', fontWeight: 600, fontFamily: '"Urbanist", sans-serif' }}>
            Hi {user?.name}, welcome to your dashboard.
          </Typography>
        </Box>
        <Button
          variant="contained"
          // make the icon white
          startIcon={<AddIcon sx={{ color: 'white' }} />}
          onClick={() => navigate('/create-collection')}
          sx={{
            backgroundColor: '#6818A5',
            '&:hover': { backgroundColor: '#5a1594' },
            borderRadius: 2,
            px: 3,
            py: 1.5,
            fontWeight: 700,
            textTransform: 'none',
            fontFamily: '"Urbanist", sans-serif',
            flexShrink: 0,
          }}
        >
          Create a Collection
        </Button>
      </Box>

      {/* Statistics Cards - Single Row, 3 cards at 25% each */}
      <Box sx={{ display: 'flex', gap: 2.5, mb: 5, width: '73%', flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
        {[
          { label: 'Active', value: stats.active },
          { label: 'Completed', value: stats.completed },
          { label: 'Scheduled', value: stats.scheduled },
        ].map((stat) => (
          <Card 
            key={stat.label}
            sx={{ 
              backgroundColor: '#F7F4FD',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
              borderRadius: 2,
              flex: '1 1 25%',
              minWidth: { xs: '100%', md: 0 },
              minHeight: '120px',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #E5E5E5'
            }}
          >
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 3 }}>
              <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 700, mb: 1, fontFamily: '"Urbanist", sans-serif' }}>
                {stat.label}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#0F172A', fontFamily: '"Urbanist", sans-serif' }}>
                {stat.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Grid Layout - Row 1: Upcoming Scheduled Collections + Multi-Site Analysis */}
      <Box sx={{ display: 'flex', gap: 2.5, mb: 2.5, width: '100%', flexDirection: { xs: 'column', lg: 'row' } }}>
        {/* Upcoming Scheduled Collections - Left side, 75% */}
        <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 75%' }, display: 'flex' }}>
          <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2, p: 2.5, width: '100%', backgroundColor: '#F9F9FA', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontFamily: '"Urbanist", sans-serif', fontSize: '1rem' }}>
                Upcoming Collections
              </Typography>
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate('/schedules')}
                sx={{
                  color: '#1E293B !important',
                  fontWeight: 600,
                  textDecoration: 'none',
                  cursor: 'pointer',
                  fontFamily: '"Urbanist", sans-serif',
                  fontSize: '0.875rem',
                  '&:hover': {
                    textDecoration: 'underline',
                    color: '#1E293B !important',
                    backgroundColor: 'transparent !important',
                  },
                }}
              >
                View more
              </Link>
            </Box>
            {stats.upcomingSchedules.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 6, minHeight: '200px' }}>
                <Box
                  component="img"
                  src={noResultsImage}
                  alt="No scheduled jobs"
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                    objectFit: 'contain',
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', mb: 1, fontFamily: '"Urbanist", sans-serif' }}>
                  No Scheduled Jobs
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', textAlign: 'center', fontFamily: '"Urbanist", sans-serif' }}>
                  You haven't run any searches yet. Create a collection and submit it to see your searches here.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {stats.upcomingSchedules.map((schedule) => (
                  <Box
                    key={schedule.id}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E5E5',
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#0F172A', fontFamily: '"Urbanist", sans-serif' }}>
                          {schedule.name}
                        </Typography>
                        <Chip
                          label={schedule.status}
                          size="small"
                          sx={{
                            backgroundColor: schedule.status === 'Active' ? '#10B981' : '#64748B',
                            color: '#FFFFFF',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            height: 20,
                          }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ color: '#64748B', mb: 1, fontFamily: '"Urbanist", sans-serif' }}>
                        {schedule.description}
                      </Typography>
                      {schedule.scheduleType && (
                        <Box sx={{ mb: 1.5 }}>
                          <Chip
                            label={schedule.scheduleType.charAt(0).toUpperCase() + schedule.scheduleType.slice(1)}
                            size="small"
                            sx={{
                              backgroundColor: '#6818A5',
                              color: '#FFFFFF',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              height: 20,
                            }}
                          />
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {schedule.next_run_at && (
                          <Typography variant="body2" sx={{ color: '#1E293B', fontFamily: '"Urbanist", sans-serif', fontSize: '0.75rem' }}>
                            Next Run: <TimeDisplay timestamp={schedule.next_run_at} format="datetime" />
                          </Typography>
                        )}
                        {schedule.last_run_at && (
                          <Typography variant="body2" sx={{ color: '#1E293B', fontFamily: '"Urbanist", sans-serif', fontSize: '0.75rem' }}>
                            Last Run: <TimeDisplay timestamp={schedule.last_run_at} format="datetime" />
                          </Typography>
                        )}
                      </Box>
              </Box>
            </Box>
                ))}
            </Box>
            )}
          </Card>
        </Box>

        {/* Multi-Site Analysis - Right side, 25% */}
        <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 25%' }, display: 'flex' }}>
          <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2, p: 2.5, width: '100%', backgroundColor: '#F9F9FA', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 2.5, fontFamily: '"Urbanist", sans-serif', fontSize: '1rem' }}>
              Volume Analysis
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, justifyContent: 'space-between', py: 0.5 }}>
              {(() => {
                // Calculate percentages that sum to 100% using largest remainder method
                const total = stats.multiSiteData.reduce((sum, site) => sum + (site.value || 0), 0);
                
                if (total === 0) {
                  // If no data, return empty state
                  return null;
                }
                
                // Calculate raw percentages
                const rawPercentages = stats.multiSiteData.map((site) => ({
                  ...site,
                  rawPercentage: (site.value || 0) / total * 100,
                }));
                
                // Calculate floor values and remainders
                const withRemainders = rawPercentages.map((item, index) => ({
                  ...item,
                  floor: Math.floor(item.rawPercentage),
                  remainder: item.rawPercentage - Math.floor(item.rawPercentage),
                  index,
                }));
                
                // Calculate sum of floors
                const floorSum = withRemainders.reduce((sum, item) => sum + item.floor, 0);
                const difference = 100 - floorSum;
                
                // Sort by remainder descending and add 1 to top items
                const sorted = [...withRemainders].sort((a, b) => b.remainder - a.remainder);
                const roundedPercentages = sorted.map((item, idx) => ({
                  ...item,
                  rounded: item.floor + (idx < difference ? 1 : 0),
                }));
                
                // Restore original order
                roundedPercentages.sort((a, b) => a.index - b.index);
                
                return roundedPercentages.map((site) => {
                  const percentage = site.rounded;
                  const segments = 4;
                  const filledSegments = Math.ceil((percentage / 100) * segments);
                  
                  return (
                    <Box key={site.name} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600, 
                          color: '#1E293B', 
                          fontFamily: '"Urbanist", sans-serif',
                          fontSize: '0.8125rem',
                          minWidth: '100px',
                          flexShrink: 0
                        }}
                      >
                        {site.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.75, flex: 1, alignItems: 'center', maxWidth: '200px', justifyContent: 'flex-end' }}>
                        {Array.from({ length: segments }).map((_, index) => {
                          let segmentColor = '#E5E5E5'; // Light gray (empty)
                          
                          if (index < filledSegments) {
                            // Determine shade: first half = black, next quarter = dark gray, last quarter = medium gray
                            const segmentPosition = index / filledSegments;
                            if (segmentPosition < 0.5) {
                              segmentColor = '#1E293B'; // Black (high usage)
                            } else if (segmentPosition < 0.75) {
                              segmentColor = '#64748B'; // Dark gray (medium usage)
                            } else {
                              segmentColor = '#94A3B8'; // Medium gray (low usage)
                            }
                          }
                          
                          return (
                            <Box
                              key={index}
                              sx={{
                                flex: 1,
                                height: '4px',
                                backgroundColor: segmentColor,
                                borderRadius: '1px',
                                border: segmentColor === '#E5E5E5' ? '1px dashed rgba(148, 163, 184, 0.3)' : 'none',
                                minWidth: '20px',
                              }}
                            />
                          );
                        })}
                      </Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600, 
                          color: '#1E293B', 
                          fontFamily: '"Urbanist", sans-serif',
                          fontSize: '0.8125rem',
                          minWidth: '45px',
                          textAlign: 'right',
                          flexShrink: 0
                        }}
                      >
                        {percentage}%
                      </Typography>
                    </Box>
                  );
                });
              })()}
            </Box>
          </Card>
        </Box>
      </Box>

      {/* Grid Layout - Row 2: Subscription Details + Upcoming Events */}
      <Box sx={{ display: 'flex', gap: 2.5, width: '100%', flexDirection: { xs: 'column', lg: 'row' } }}>
        {/* Subscription Details - Left side */}
        <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 50%' }, display: 'flex' }}>
          <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2, p: 2, width: '100%', backgroundColor: '#F9F9FA', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontFamily: '"Urbanist", sans-serif', fontSize: '1rem' }}>
                Your Subscription details
              </Typography>
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate('/wallet')}
                sx={{
                  color: '#1E293B !important',
                  fontWeight: 600,
                  textDecoration: 'none',
                  cursor: 'pointer',
                  fontFamily: '"Urbanist", sans-serif',
                  fontSize: '0.875rem',
                  '&:hover': { 
                    textDecoration: 'underline',
                    color: '#1E293B !important',
                    backgroundColor: 'transparent !important',
                  },
                }}
              >
                More
              </Link>
            </Box>
            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 700, color: '#0F172A', fontFamily: '"Urbanist", sans-serif' }}>
                  {stats.subscription.planName}
            </Typography>
                <Chip
                  label={stats.subscription.status}
                  size="small"
                  sx={{
                    backgroundColor: '#71DD8C',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: 20,
                  }}
                />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', mb: 1.5, fontFamily: '"Urbanist", sans-serif' }}>
                ${stats.subscription.balance.toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', fontFamily: '"Urbanist", sans-serif' }}>
                {/* Upto {stats.subscription.totalInputs.toLocaleString()} inputs */}
              </Typography>
            </Box>
            
            {/* Recent Transactions */}
            {stats.subscription.recentTransactions.length > 0 ? (
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', mb: 1.5, fontFamily: '"Urbanist", sans-serif' }}>
                  Recent Transactions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {stats.subscription.recentTransactions.map((txn) => (
                    <Box key={txn.id} sx={{ pb: 1.5, borderBottom: '1px solid #E5E5E5' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ color: '#1E293B', fontFamily: '"Urbanist", sans-serif', fontSize: '0.75rem' }}>
                          {txn.description || `${txn.type} transaction`}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: txn.type === 'credit' ? '#10B981' : '#EF4444',
                            fontWeight: 600,
                            fontFamily: '"Urbanist", sans-serif',
                            fontSize: '0.75rem'
                          }}
                        >
                          {txn.type === 'credit' ? '+' : '-'}${txn.amount.toFixed(2)}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#64748B', fontFamily: '"Urbanist", sans-serif' }}>
                        <TimeDisplay timestamp={txn.timestamp} format="date" />
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <Box sx={{ py: 3, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" sx={{ color: '#64748B', fontFamily: '"Urbanist", sans-serif', textAlign: 'center' }}>
                  No recent transactions
                </Typography>
              </Box>
            )}
          </Card>
        </Box>

        {/* Upcoming Events - Right side */}
        <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 50%' }, display: 'flex' }}>
          <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: 2, p: 2, width: '100%', backgroundColor: '#F9F9FA', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontFamily: '"Urbanist", sans-serif', fontSize: '1rem' }}>
                Upcoming Events
            </Typography>
              <Link
                component="button"
                variant="body2"
                onClick={() => {}}
                sx={{
                  color: '#1E293B !important',
                  fontWeight: 600,
                  textDecoration: 'none',
                  cursor: 'pointer',
                  fontFamily: '"Urbanist", sans-serif',
                  fontSize: '0.875rem',
                  '&:hover': { 
                    textDecoration: 'underline',
                    color: '#1E293B !important',
                    backgroundColor: 'transparent !important',
                  },
                }}
              >
                View more
              </Link>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {stats.events.map((event) => (
                <Box
                  key={event.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E5E5',
                    display: 'flex',
                    gap: 1.5,
                  }}
                >
                    <Box
                    component="img"
                    src={event.imageUrl}
                    alt={event.title}
                      sx={{
                      width: 80,
                      height: 80,
                      borderRadius: 2,
                      objectFit: 'cover',
                      flexShrink: 0,
                      }}
                    />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5, fontFamily: '"Urbanist", sans-serif' }}>
                      {event.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748B', mb: 0.5, fontFamily: '"Urbanist", sans-serif' }}>
                      {formatEventDate(event.date, event.endDate)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748B', fontFamily: '"Urbanist", sans-serif' }}>
                      {event.location}
                    </Typography>
                  </Box>
                  <Box
                    component="a"
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      backgroundColor: '#6818A5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                      textDecoration: 'none',
                      '&:hover': { backgroundColor: '#5a1594' },
                    }}
                  >
                    <OpenInNewIcon sx={{ color: 'white', fontSize: 18 }} />
                  </Box>
                  </Box>
                ))}
            </Box>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;

