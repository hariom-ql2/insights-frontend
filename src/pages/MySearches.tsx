import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
  Card,
  CardContent,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Pagination,
  Stack,
  Menu,
  MenuItem,
  FormControl,
  Select,
  Tooltip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import UnfoldMore from '@mui/icons-material/UnfoldMore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import TimeDisplay from '../components/TimeDisplay';
import viewIcon from '../../icons/view.svg';
import starIcon from '../../icons/star.svg';
import axios from 'axios';

interface Search {
  id: number;
  job_name: string;
  collection_name?: string;
  run_id?: number;
  timestamp: string; // DD-MM-YYYY HH:MM:SS
  status: string;
  output?: string;
}

interface SearchItem {
  id: number;
  location: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  star_rating: string;
  website: string;
  pos: string[];
  amount: number;
}

interface SearchFilters {
  collectionName: string;
  status: string;
  location: string;
  website: string;
  checkInStart: Date | null;
  checkInEnd: Date | null;
  checkOutStart: Date | null;
  checkOutEnd: Date | null;
  scheduled: 'all' | 'scheduled' | 'normal';
}

// Parse timestamp function - moved outside component for stability
const parseTimestamp = (ts: string): number => {
  const [datePart, timePart] = ts.split(' ');
  if (!datePart || !timePart) return 0;
  const [d, m, y] = datePart.split('-').map(Number);
  const [hh, mm, ss] = timePart.split(':').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, ss || 0);
  return dt.getTime();
};

// Star Rating Display Component
const StarRatingDisplay = ({ rating }: { rating: string }) => {
  // Parse rating (e.g., "3", "4+", "5")
  const numStars = parseInt(rating.replace('+', '')) || 0;
  const hasPlus = rating.includes('+');
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {Array.from({ length: numStars }).map((_, index) => (
        <img 
          key={index} 
          src={starIcon} 
          alt="star" 
          style={{ width: 16, height: 16 }} 
        />
      ))}
      {hasPlus && (
        <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600, ml: 0.5 }}>
          +
        </Typography>
      )}
    </Box>
  );
};

const MySearches: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  const [searches, setSearches] = useState<Search[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchDetailsOpen, setSearchDetailsOpen] = useState(false);
  const [selectedSearch, setSelectedSearch] = useState<Search | null>(null);
  const [searchItems, setSearchItems] = useState<SearchItem[]>([]);
  const [searchItemsLoading, setSearchItemsLoading] = useState(false);
  const [refreshingJobs, setRefreshingJobs] = useState<Set<number>>(new Set());
  const [downloadMenuAnchor, setDownloadMenuAnchor] = useState<{ anchor: HTMLElement; search: Search } | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<'csv' | 'json'>('csv');
  
  // Status filter menu state
  const [statusFilterAnchor, setStatusFilterAnchor] = useState<null | HTMLElement>(null);
  
  // Sorting state
  const [sortColumn, setSortColumn] = useState<'created' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Sites state for Website dropdown
  const [sites, setSites] = useState<{ code: string; name: string }[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [filters, setFilters] = useState<SearchFilters>({
    collectionName: '',
    status: 'all',
    location: '',
    website: '',
    checkInStart: null,
    checkInEnd: null,
    checkOutStart: null,
    checkOutEnd: null,
    scheduled: 'all'
  });

  const fetchSites = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
      const response = await axios.get(`${API_BASE_URL}/sites`);
      const allSites = response.data.sites || [];
      const sitesFormatted = allSites.map((siteName: string) => ({
        code: siteName,
        name: siteName
      }));
      setSites(sitesFormatted);
    } catch (error) {
      console.error('Error fetching sites:', error);
      setSites([]);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    } else if (user) {
      fetchSearches();
      fetchSites();
    }
  }, [isAuthenticated, user, navigate]);

  const fetchSearches = async (filterParams?: SearchFilters) => {
    if (!user || !token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const activeFilters = filterParams || filters;
      if (activeFilters.location) params.append('location', activeFilters.location);
      if (activeFilters.website) params.append('website', activeFilters.website);
      if (activeFilters.checkInStart) {
        const date = activeFilters.checkInStart instanceof Date 
          ? activeFilters.checkInStart
          : new Date(activeFilters.checkInStart);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`; // YYYY-MM-DD in local timezone
        params.append('checkInStart', dateStr);
      }
      if (activeFilters.checkOutStart) {
        const date = activeFilters.checkOutStart instanceof Date 
          ? activeFilters.checkOutStart
          : new Date(activeFilters.checkOutStart);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`; // YYYY-MM-DD in local timezone
        params.append('checkOutStart', dateStr);
      }
      if (activeFilters.scheduled === 'scheduled') params.append('scheduled', 'true');
      if (activeFilters.scheduled === 'normal') params.append('scheduled', 'false');

      const response = await apiService.get(`/my-searches?${params.toString()}`, token);
      if (response.success) {
        // Don't pre-sort here - let the user's sort preference control the order
        setSearches((response as any).searches || []);
      } else {
        setSearches([]);
      }
    } catch (error) {
      console.error('Error fetching searches:', error);
      setSearches([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce effect for text inputs
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (filters.collectionName || filters.location || filters.website) {
        setCurrentPage(1);
        fetchSearches(filters);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [filters.collectionName, filters.location, filters.website]);

  // Auto-apply for non-text filters (status, dates, scheduled)
  useEffect(() => {
    setCurrentPage(1);
    fetchSearches(filters);
  }, [filters.status, filters.checkInStart, filters.checkInEnd, filters.checkOutStart, filters.checkOutEnd, filters.scheduled]);

  const handleFilterChange = (field: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    const cleared: SearchFilters = { collectionName: '', status: 'all', location: '', website: '', checkInStart: null, checkInEnd: null, checkOutStart: null, checkOutEnd: null, scheduled: 'all' };
    setFilters(cleared);
    setCurrentPage(1);
    fetchSearches(cleared);
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  // Apply filters to searches
  let filteredSearches = searches.filter(search => {
    // Collection name filter
    const searchName = search.collection_name || search.job_name || '';
    if (filters.collectionName && !searchName.toLowerCase().includes(filters.collectionName.toLowerCase())) {
      return false;
    }
    // Status filter
    if (filters.status !== 'all' && search.status !== filters.status) {
      return false;
    }
    return true;
  });

  // Apply sorting
  if (sortColumn === 'created') {
    filteredSearches = [...filteredSearches].sort((a, b) => {
      const aValue = parseTimestamp(a.timestamp);
      const bValue = parseTimestamp(b.timestamp);
      
      if (sortDirection === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  } else if (sortColumn === null) {
    // Default sort by timestamp descending if no sort column selected
    filteredSearches = [...filteredSearches].sort((a, b) => parseTimestamp(b.timestamp) - parseTimestamp(a.timestamp));
  }

  const totalPages = Math.ceil(filteredSearches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSearches = filteredSearches.slice(startIndex, endIndex);

  // Status filter menu handlers
  const handleStatusFilterOpen = (event: React.MouseEvent<HTMLElement>) => {
    setStatusFilterAnchor(event.currentTarget);
  };

  const handleStatusFilterClose = () => {
    setStatusFilterAnchor(null);
  };

  const handleStatusFilterSelect = (status: string) => {
    handleFilterChange('status', status);
    setStatusFilterAnchor(null);
  };

  // Sorting handlers
  const handleSort = (column: 'created') => {
    if (sortColumn === column) {
      // Toggle direction
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, start with descending (latest to old) to maintain current order
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const handleSearchClick = async (search: Search) => {
    if (!token) return;
    setSelectedSearch(search);
    setSearchDetailsOpen(true);
    setSearchItemsLoading(true);
    try {
      const response = await apiService.get(`/search/${search.id}`, token);
      setSearchItems(response.success ? ((response as any).search?.search_items || []) : []);
    } catch (error) {
      console.error('Error fetching search details:', error);
      setSearchItems([]);
    } finally {
      setSearchItemsLoading(false);
    }
  };

  const refreshJobStatus = async (jobId: number) => {
    if (!token) return;
    
    setRefreshingJobs(prev => new Set(prev).add(jobId));
    
    try {
      const response = await apiService.post(`/refresh-job-status/${jobId}`, {}, token);
      
      if (response.success) {
        // Refresh the entire list to get updated status
        await fetchSearches();
        alert(response.message);
      } else {
        alert(response.message || 'Failed to refresh job status');
      }
    } catch (error) {
      alert('Error refreshing job status');
    } finally {
      setRefreshingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const handleDownloadMenuOpen = (event: React.MouseEvent<HTMLElement>, search: Search) => {
    event.stopPropagation();
    setDownloadMenuAnchor({ anchor: event.currentTarget, search });
  };

  const handleDownloadMenuClose = () => {
    setDownloadMenuAnchor(null);
  };

  const handleDownloadFormatSelect = (format: 'csv' | 'json', search: Search) => {
    setDownloadFormat(format);
    setDownloadMenuAnchor(null);
    downloadSearchOutput(search, format);
  };

  const downloadSearchOutput = async (search: Search, format: 'csv' | 'json' = downloadFormat) => {
    if (!token) return;
    
    // run_id should always be available since users refresh job status before downloading
    if (!search.run_id) {
      alert('Please refresh the job status before downloading');
      return;
    }
    
    try {
      const formatParam = format === 'json' ? '?format=json' : '?format=csv';
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
      const response = await fetch(`${API_BASE_URL}/download-by-run-id/${search.run_id}${formatParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const extension = format === 'json' ? 'json' : 'csv';
        a.download = `search_${search.run_id}_${search.timestamp}.${extension}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download file');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading file');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircleIcon sx={{ color: 'green', ml: 1, verticalAlign: 'middle' }} />;
      case 'Error occured':
      case 'Aborted':
        return <CancelIcon sx={{ color: 'red', ml: 1, verticalAlign: 'middle' }} />;
      case 'Executing':
        return <HourglassEmptyIcon sx={{ color: 'goldenrod', ml: 1, verticalAlign: 'middle' }} />;
      case 'Initializing':
      case 'Completing':
        return <RadioButtonUncheckedIcon sx={{ color: 'gray', ml: 1, verticalAlign: 'middle' }} />;
      default:
        return <RadioButtonUncheckedIcon sx={{ color: 'gray', ml: 1, verticalAlign: 'middle' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Error occured':
      case 'Aborted':
        return 'error';
      case 'Executing':
        return 'warning';
      case 'Initializing':
      case 'Completing':
        return 'default';
      default:
        return 'default';
    }
  };

  const isTerminalState = (status: string) => {
    return status === 'Completed' || status === 'Error occured' || status === 'Aborted';
  };

  if (loading && searches.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#6818A5', fontFamily: '"Urbanist", sans-serif' }}>
          Results
        </Typography>
      </Box>

      {/* Horizontal Filter Bar */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2,
        flexWrap: 'nowrap',
        mb: 3
      }}>
        {/* Left Side: Collection Name, Location */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: '0 1 auto' }}>
          <TextField
            placeholder="Collection Name"
            value={filters.collectionName}
            onChange={(e) => handleFilterChange('collectionName', e.target.value)}
            size="small"
            sx={{
              minWidth: '220px',
              width: '220px',
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#6818A5',
                  borderWidth: 1.5,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#6818A5',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#6818A5',
                  borderWidth: 2,
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ color: '#64748B', mr: 1, fontSize: 16 }} />
              ),
            }}
          />

          <TextField
            placeholder="Location"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            size="small"
            sx={{
              minWidth: '200px',
              width: '200px',
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#6818A5',
                  borderWidth: 1.5,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#6818A5',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#6818A5',
                  borderWidth: 2,
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <LocationOnIcon sx={{ color: '#64748B', mr: 1, fontSize: 16 }} />
              ),
            }}
          />
        </Box>

        {/* Right Side: Website, Check-in, Check-out, Clear All */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: '0 1 auto', ml: 'auto' }}>
          <FormControl size="small" sx={{ minWidth: '160px', width: '160px' }}>
            <Select
              value={filters.website || ''}
              onChange={(e) => handleFilterChange('website', e.target.value)}
              displayEmpty
              sx={{
                borderRadius: 2,
                fontSize: '0.875rem',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#6818A5',
                  borderWidth: 1.5,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#6818A5'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#6818A5',
                  borderWidth: 2
                }
              }}
            >
              <MenuItem value="">Website</MenuItem>
              {sites.map((site) => (
                <MenuItem key={site.code} value={site.name}>{site.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={filters.checkInStart}
              onChange={(date) => handleFilterChange('checkInStart', date)}
              slotProps={{ 
                textField: { 
                  size: 'small',
                  placeholder: 'Check-in Date',
                  sx: {
                    minWidth: '160px',
                    width: '160px',
                    fontSize: '0.875rem',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6818A5',
                        borderWidth: 1.5,
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6818A5',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6818A5',
                        borderWidth: 2,
                      },
                    },
                  }
                } 
              }}
              slots={{
                openPickerIcon: () => <CalendarMonthIcon sx={{ color: '#64748B', fontSize: 16 }} />
              }}
            />
          </LocalizationProvider>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={filters.checkOutStart}
              onChange={(date) => handleFilterChange('checkOutStart', date)}
              slotProps={{ 
                textField: { 
                  size: 'small',
                  placeholder: 'Check-out Date',
                  sx: {
                    minWidth: '160px',
                    width: '160px',
                    fontSize: '0.875rem',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6818A5',
                        borderWidth: 1.5,
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6818A5',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6818A5',
                        borderWidth: 2,
                      },
                    },
                  }
                } 
              }}
              slots={{
                openPickerIcon: () => <CalendarMonthIcon sx={{ color: '#64748B', fontSize: 16 }} />
              }}
            />
          </LocalizationProvider>

          <Button
            variant="outlined"
            onClick={handleClearFilters}
            sx={{ 
              borderColor: '#6818A5',
              color: '#6818A5',
              backgroundColor: '#FFFFFF',
              borderRadius: 2,
              px: 1.5,
              py: 0.5,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.875rem',
              '&:hover': { 
                borderColor: '#5a1594',
                backgroundColor: '#F7F4FD'
              },
              fontFamily: '"Urbanist", sans-serif'
            }}
          >
            Clear All
          </Button>
        </Box>
      </Box>

      <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 1 }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F7F4FD' }}>
                  <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Collection Name</TableCell>
                  <TableCell 
                    sx={{ fontWeight: 800, color: '#0F172A', width: '180px', cursor: 'pointer' }} 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSort('created');
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Created At
                      {sortColumn === 'created' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUpward sx={{ fontSize: 18, color: '#6818A5' }} />
                        ) : (
                          <ArrowDownward sx={{ fontSize: 18, color: '#6818A5' }} />
                        )
                      ) : (
                        <UnfoldMore sx={{ fontSize: 18, color: '#64748B' }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#0F172A', width: '150px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Status
                      <IconButton
                        size="small"
                        onClick={handleStatusFilterOpen}
                        sx={{
                          padding: '2px',
                          color: filters.status !== 'all' ? '#6818A5' : '#64748B',
                          '&:hover': {
                            backgroundColor: 'rgba(104, 24, 165, 0.1)',
                            color: '#6818A5'
                          }
                        }}
                      >
                        <FilterListIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                      <Menu
                        anchorEl={statusFilterAnchor}
                        open={Boolean(statusFilterAnchor)}
                        onClose={handleStatusFilterClose}
                        PaperProps={{
                          sx: { mt: 1.5, borderRadius: 2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }
                        }}
                      >
                        <MenuItem onClick={() => handleStatusFilterSelect('all')} selected={filters.status === 'all'}>
                          All
                        </MenuItem>
                        <MenuItem onClick={() => handleStatusFilterSelect('Submitted')} selected={filters.status === 'Submitted'}>
                          Submitted
                        </MenuItem>
                        <MenuItem onClick={() => handleStatusFilterSelect('Scheduled')} selected={filters.status === 'Scheduled'}>
                          Scheduled
                        </MenuItem>
                        <MenuItem onClick={() => handleStatusFilterSelect('Completed')} selected={filters.status === 'Completed'}>
                          Completed
                        </MenuItem>
                        <MenuItem onClick={() => handleStatusFilterSelect('Aborted')} selected={filters.status === 'Aborted'}>
                          Aborted
                        </MenuItem>
                      </Menu>
                      <Tooltip
                        title={
                          <Box sx={{ p: 0.5 }}>
                            <Typography variant="body2" sx={{ mb: 0.5, color: '#FFFFFF' }}>• <strong>Submitted:</strong> Job is submitted</Typography>
                            <Typography variant="body2" sx={{ mb: 0.5, color: '#FFFFFF' }}>• <strong>Executing:</strong> Job is currently running</Typography>
                            <Typography variant="body2" sx={{ mb: 0.5, color: '#FFFFFF' }}>• <strong>Completed:</strong> Job finished successfully</Typography>
                            <Typography variant="body2" sx={{ color: '#FFFFFF' }}>• <strong>Aborted:</strong> Job was aborted or encountered an error</Typography>
                          </Box>
                        }
                        arrow
                        placement="top"
                        componentsProps={{
                          tooltip: {
                            sx: {
                              backgroundColor: '#1E293B',
                              color: '#FFFFFF',
                              fontSize: '0.875rem',
                              padding: '8px 12px',
                              maxWidth: '300px',
                              '& .MuiTooltip-arrow': {
                                color: '#1E293B'
                              }
                            }
                          }
                        }}
                      >
                        <InfoIcon sx={{ fontSize: 16, color: '#6818A5', cursor: 'help' }} />
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#0F172A', width: '100px' }}>Output</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#0F172A', width: '100px' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSearches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 8 }}>
                      <Typography variant="h6" sx={{ mb: 2, color: '#6818A5', fontWeight: 700, fontFamily: '"Urbanist", sans-serif' }}>
                        No Results Found
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                        {Object.values(filters).some(v => v !== '' && v !== null && v !== 'all') ? 'Try adjusting your filters or clear them to see all searches.' : 'You haven\'t run any collections yet. Create a collection and submit it to see your results here.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentSearches.map((search) => (
                    <TableRow 
                      key={search.id} 
                      sx={{ 
                        '&:hover': { backgroundColor: '#F8FAFC' }, 
                        '&:last-child td, &:last-child th': { border: 0 } 
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: '#1E293B', maxWidth: '300px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, flexShrink: 0 }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="#6818A5"/>
                            </svg>
                          </Box>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 600,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '100%'
                            }}
                            title={search.collection_name || search.job_name}
                          >
                            {search.collection_name || search.job_name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                        <TimeDisplay timestamp={search.timestamp} format="datetime" />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                        <Chip 
                          label={search.status} 
                          color={getStatusColor(search.status) as any} 
                          variant={getStatusColor(search.status) === 'default' ? 'outlined' : 'filled'}
                          size="small" 
                          icon={getStatusIcon(search.status)}
                          sx={{ 
                            fontWeight: 600,
                            ...(getStatusColor(search.status) === 'default' ? {
                              borderColor: '#E2E8F0',
                              color: '#1E293B',
                              backgroundColor: 'transparent'
                            } : {
                              color: '#FFFFFF',
                              '& .MuiChip-label': { color: '#FFFFFF !important' },
                              '& .MuiChip-icon': { color: '#FFFFFF !important' }
                            })
                          }}
                        />
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {search.status === 'Completed' && search.output ? (
                          <>
                          <IconButton 
                              onClick={(e) => handleDownloadMenuOpen(e, search)} 
                              title="Download Output" 
                            size="small" 
                            sx={{ 
                              color: '#0F172A',
                              backgroundColor: 'rgba(35, 35, 35, 0.05)',
                              borderRadius: 2,
                              padding: '6px',
                              minWidth: '24px',
                              height: '24px',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                backgroundColor: 'rgba(104, 24, 165, 0.1)',
                                color: '#6818A5',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 2px 8px rgba(104, 24, 165, 0.2)'
                              }
                            }}
                          >
                            <DownloadIcon />
                          </IconButton>
                            <Menu
                              anchorEl={downloadMenuAnchor?.anchor || null}
                              open={Boolean(downloadMenuAnchor)}
                              onClose={handleDownloadMenuClose}
                              PaperProps={{
                                sx: { mt: 1.5, borderRadius: 2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }
                              }}
                            >
                              <MenuItem 
                                onClick={() => downloadMenuAnchor && handleDownloadFormatSelect('csv', downloadMenuAnchor.search)} 
                                selected={downloadFormat === 'csv'}
                              >
                                Download as CSV
                              </MenuItem>
                              <MenuItem 
                                onClick={() => downloadMenuAnchor && handleDownloadFormatSelect('json', downloadMenuAnchor.search)} 
                                selected={downloadFormat === 'json'}
                              >
                                Download as JSON
                              </MenuItem>
                            </Menu>
                          </>
                          ) : (
                          <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>{'--'}</Typography>
                        )}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Stack direction="row" spacing={1}>
                          <IconButton 
                            onClick={() => handleSearchClick(search)} 
                            title="View Details" 
                            size="small" 
                            sx={{ 
                              color: '#0F172A',
                              backgroundColor: 'rgba(35, 35, 35, 0.05)',
                              borderRadius: 2,
                              padding: '6px',
                              minWidth: '24px',
                              height: '24px',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                backgroundColor: 'rgba(104, 24, 165, 0.1)',
                                color: '#6818A5',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 2px 8px rgba(104, 24, 165, 0.2)'
                              }
                            }}
                          >
                            <img 
                              src={viewIcon} 
                              alt="View" 
                              style={{ 
                                width: 20, 
                                height: 20,
                                display: 'block',
                                filter: 'brightness(0) saturate(100%)'
                              }} 
                            />
                          </IconButton>
                        {!isTerminalState(search.status) && (
                          <IconButton 
                            onClick={() => refreshJobStatus(search.id)} 
                            title="Refresh Status" 
                            size="small" 
                            disabled={refreshingJobs.has(search.id)}
                            sx={{ 
                              color: '#0F172A',
                              backgroundColor: 'rgba(35, 35, 35, 0.05)',
                              borderRadius: 2,
                              padding: '6px',
                              minWidth: '24px',
                              height: '24px',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                backgroundColor: 'rgba(104, 24, 165, 0.1)',
                                color: '#6818A5',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 2px 8px rgba(104, 24, 165, 0.2)'
                              },
                              '&:disabled': {
                                backgroundColor: 'rgba(145, 145, 145, 0.05)',
                                color: '#64748B'
                              }
                            }}
                          >
                              <RefreshIcon sx={{ fontSize: 20 }} />
                          </IconButton>
                        )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          )}
        </CardContent>
      </Card>

      {filteredSearches.length > itemsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Stack spacing={2}>
            <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" size="large" showFirstButton showLastButton sx={{ '& .MuiPaginationItem-root': { fontSize: '1rem', fontWeight: 500 }, '& .Mui-selected': { backgroundColor: '#3B82F6', color: 'white', '&:hover': { backgroundColor: '#2563EB' } } }} />
            <Typography variant="body2" sx={{ textAlign: 'center', color: '#1E293B', fontWeight: 600 }}>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredSearches.length)} of {filteredSearches.length} results
            </Typography>
          </Stack>
        </Box>
      )}

      <Dialog 
        open={searchDetailsOpen} 
        onClose={() => setSearchDetailsOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 1 }
        }}
      >
        <DialogTitle>Search Details: {selectedSearch?.collection_name || selectedSearch?.job_name}</DialogTitle>
        <DialogContent>
          {selectedSearch && (
            <Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: '#1E293B', mb: 1, fontWeight: 600 }}><strong>Status:</strong> {selectedSearch.status}</Typography>
                <Typography variant="body2" sx={{ color: '#1E293B', mb: 1, fontWeight: 600 }}><strong>Created:</strong> <TimeDisplay timestamp={selectedSearch.timestamp} format="datetime" /></Typography>
                <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}><strong>Items:</strong> {searchItems.length}</Typography>
              </Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 800, color: '#0F172A' }}>Search Items</Typography>
              {searchItemsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                  <CircularProgress />
                </Box>
              ) : searchItems.length === 0 ? (
                <Typography>No search items found.</Typography>
              ) : (
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                        <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Dates</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Adults</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Star Rating</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Websites</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {searchItems.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>{index + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}><Typography variant="body2" sx={{ fontWeight: 600 }}>{item.location}</Typography></TableCell>
                          <TableCell><Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{item.check_in_date} to {item.check_out_date}</Typography></TableCell>
                          <TableCell>{item.adults}</TableCell>
                          <TableCell>
                            <StarRatingDisplay rating={item.star_rating} />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {item.website && (
                                <Box sx={{ backgroundColor: '#E3F2FD', color: '#1976D2', padding: '2px 8px', borderRadius: 2, fontSize: '0.7rem', fontWeight: 600 }}>
                                  {item.website}{item.pos && item.pos.length ? ` (${item.pos.join(', ')})` : ''}
                                </Box>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setSearchDetailsOpen(false)}
            sx={{
              backgroundColor: '#6818A5',
              color: '#ffffff',
              borderRadius: 2,
              '&:hover': { backgroundColor: '#5a1594' },
              fontFamily: '"Urbanist", sans-serif'
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MySearches;
