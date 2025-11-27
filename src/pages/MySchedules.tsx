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
  CircularProgress,
  Button,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Pagination,
  Menu
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Search as SearchIcon,
  ArrowUpward,
  ArrowDownward,
  UnfoldMore,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { schedulesApi, apiService } from '../services/api';
import TimeDisplay from '../components/TimeDisplay';
import noResultsImage from '../../icons/no-results.png';
import viewIcon from '../../icons/view.svg';
import deleteIcon from '../../icons/delete.svg';

// Custom Action Button Component
const ActionButton = ({ 
  onClick, 
  disabled, 
  children, 
  color = '#0F172A', 
  hoverColor = '#6818A5',
  title
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  color?: string;
  hoverColor?: string;
  title?: string;
}) => (
  <IconButton
    size="small"
    onClick={onClick}
    disabled={disabled}
    title={title}
    sx={{
      color: color,
      backgroundColor: 'rgba(35, 35, 35, 0.05)',
      borderRadius: 2,
      padding: '6px',
      minWidth: '24px',
      height: '24px',
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: 'rgba(104, 24, 165, 0.1)',
        color: hoverColor,
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 8px rgba(104, 24, 165, 0.2)'
      },
      '&:disabled': {
        backgroundColor: 'rgba(145, 145, 145, 0.05)',
        color: '#1E293B'
      }
    }}
  >
    {children}
  </IconButton>
);

interface Schedule {
  id: number;
  name: string;
  schedule_type: 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly';
  schedule_data: any;
  collection_id?: number;
  search_id?: number;
  is_active: boolean;
  next_run_at?: string;
  last_run_at?: string;
  created_at: string;
  updated_at: string;
}

const MySchedules: React.FC = () => {
  const { token } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [scheduledSearchDetails, setScheduledSearchDetails] = useState<any>(null);
  const [searchDetailsLoading, setSearchDetailsLoading] = useState(false);
  const [filters, setFilters] = useState({
    scheduleName: ''
  });
  
  // Column filter states
  const [typeFilter, setTypeFilter] = useState<'all' | 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Filter menu anchors
  const [typeFilterAnchor, setTypeFilterAnchor] = useState<null | HTMLElement>(null);
  const [statusFilterAnchor, setStatusFilterAnchor] = useState<null | HTMLElement>(null);
  
  // Sorting state
  const [sortColumn, setSortColumn] = useState<'next_run' | 'last_run' | 'created' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      console.log('Fetching schedules with token:', token ? 'Token exists' : 'No token');
      const response = await schedulesApi.getSchedules(token);
      console.log('Schedules API response:', response);
      
      if (response.success && response.data) {
        console.log('Setting schedules:', response.data);
        setSchedules(response.data);
      } else {
        console.log('API call failed or no data:', response);
      }
    } catch (err) {
      console.error('Error fetching schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchScheduledSearchDetails = async (schedule: Schedule) => {
    try {
      setSearchDetailsLoading(true);
      
      // If schedule has a collection_id, fetch collection details
      if (schedule.collection_id) {
        const response = await apiService.get(`/collection/${schedule.collection_id}`, token);
        if (response.success) {
          setScheduledSearchDetails({
            type: 'collection',
            data: response
          });
        }
      }
      // If schedule has a search_id, fetch search details
      else if (schedule.search_id) {
        const response = await apiService.get(`/search/${schedule.search_id}`, token);
        if (response.success) {
          setScheduledSearchDetails({
            type: 'search',
            data: response
          });
        }
      }
    } catch (err) {
      console.error('Error fetching scheduled search details:', err);
    } finally {
      setSearchDetailsLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      const response = await schedulesApi.deleteSchedule(scheduleId, token);
      
      if (response.success) {
        setSchedules(schedules.filter(s => s.id !== scheduleId));
        alert('Schedule deleted successfully');
      } else {
        alert(response.message || 'Failed to delete schedule');
      }
    } catch (err) {
      alert('Network error occurred');
      console.error('Error deleting schedule:', err);
    }
  };

  const handleViewDetails = async (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setDetailsOpen(true);
    await fetchScheduledSearchDetails(schedule);
  };

  const getScheduleTypeLabel = (type: string) => {
    switch (type) {
      case 'once': return 'Once';
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'biweekly': return 'Bi-weekly';
      case 'monthly': return 'Monthly';
      default: return type;
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Sorting handlers
  const handleSort = (column: 'next_run' | 'last_run' | 'created') => {
    if (sortColumn === column) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, start with ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Filter menu handlers
  const handleTypeFilterOpen = (event: React.MouseEvent<HTMLElement>) => {
    setTypeFilterAnchor(event.currentTarget);
  };

  const handleTypeFilterClose = () => {
    setTypeFilterAnchor(null);
  };

  const handleTypeFilterSelect = (type: 'all' | 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly') => {
    setTypeFilter(type);
    setTypeFilterAnchor(null);
  };

  const handleStatusFilterOpen = (event: React.MouseEvent<HTMLElement>) => {
    setStatusFilterAnchor(event.currentTarget);
  };

  const handleStatusFilterClose = () => {
    setStatusFilterAnchor(null);
  };

  const handleStatusFilterSelect = (status: 'all' | 'active' | 'inactive') => {
    setStatusFilter(status);
    setStatusFilterAnchor(null);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#6818A5', fontFamily: '"Urbanist", sans-serif' }}>
          My Schedules
        </Typography>
      </Box> 

      {/* Horizontal Filter Bar */}
      <Box sx={{ 
        display: 'flex', 
        gap: 1, 
        alignItems: 'center',
        mb: 3,
        width: '100%'
      }}>
        {/* Schedule Name */}
              <TextField
          placeholder="Schedule Name"
                value={filters.scheduleName}
                onChange={(e) => setFilters({ ...filters, scheduleName: e.target.value })}
                size="small"
                fullWidth
                sx={{
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
              <SearchIcon sx={{ color: '#64748B', mr: 1, fontSize: 18 }} />
            ),
          }}
        />
            </Box>

      {(() => {
        // Apply filters to schedules
        let filteredSchedules = schedules.filter(schedule => {
          // Schedule name filter
          if (filters.scheduleName && !schedule.name.toLowerCase().includes(filters.scheduleName.toLowerCase())) {
            return false;
          }
          // Type filter
          if (typeFilter !== 'all' && schedule.schedule_type !== typeFilter) {
            return false;
          }
          // Status filter
          if (statusFilter !== 'all') {
            const isActive = schedule.is_active;
            if (statusFilter === 'active' && !isActive) return false;
            if (statusFilter === 'inactive' && isActive) return false;
          }
          return true;
        });

        // Apply sorting
        if (sortColumn) {
          filteredSchedules = [...filteredSchedules].sort((a, b) => {
            let aValue: number;
            let bValue: number;
            
            if (sortColumn === 'next_run') {
              aValue = a.next_run_at ? new Date(a.next_run_at).getTime() : 0;
              bValue = b.next_run_at ? new Date(b.next_run_at).getTime() : 0;
            } else if (sortColumn === 'last_run') {
              aValue = a.last_run_at ? new Date(a.last_run_at).getTime() : 0;
              bValue = b.last_run_at ? new Date(b.last_run_at).getTime() : 0;
            } else { // created
              aValue = new Date(a.created_at).getTime();
              bValue = new Date(b.created_at).getTime();
            }
            
            if (sortDirection === 'asc') {
              return aValue - bValue;
            } else {
              return bValue - aValue;
            }
          });
        }

        // Calculate pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentSchedules = filteredSchedules.slice(startIndex, endIndex);

        return (
        <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 2 }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F7F4FD' }}>
                    <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Schedule</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        Type
                        <IconButton
                          size="small"
                          onClick={handleTypeFilterOpen}
                          sx={{
                            padding: '2px',
                            color: typeFilter !== 'all' ? '#6818A5' : '#64748B',
                            '&:hover': {
                              backgroundColor: 'rgba(104, 24, 165, 0.1)',
                              color: '#6818A5'
                            }
                          }}
                        >
                          <FilterListIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                        <Menu
                          anchorEl={typeFilterAnchor}
                          open={Boolean(typeFilterAnchor)}
                          onClose={handleTypeFilterClose}
                          PaperProps={{
                            sx: { mt: 1.5, borderRadius: 2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }
                          }}
                        >
                          <MenuItem onClick={() => handleTypeFilterSelect('all')} selected={typeFilter === 'all'}>
                            All
                          </MenuItem>
                          <MenuItem onClick={() => handleTypeFilterSelect('once')} selected={typeFilter === 'once'}>
                            Once
                          </MenuItem>
                          <MenuItem onClick={() => handleTypeFilterSelect('daily')} selected={typeFilter === 'daily'}>
                            Daily
                          </MenuItem>
                          <MenuItem onClick={() => handleTypeFilterSelect('weekly')} selected={typeFilter === 'weekly'}>
                            Weekly
                          </MenuItem>
                          <MenuItem onClick={() => handleTypeFilterSelect('biweekly')} selected={typeFilter === 'biweekly'}>
                            Bi-weekly
                          </MenuItem>
                          <MenuItem onClick={() => handleTypeFilterSelect('monthly')} selected={typeFilter === 'monthly'}>
                            Monthly
                          </MenuItem>
                        </Menu>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        Status
                        <IconButton
                          size="small"
                          onClick={handleStatusFilterOpen}
                          sx={{
                            padding: '2px',
                            color: statusFilter !== 'all' ? '#6818A5' : '#64748B',
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
                          <MenuItem onClick={() => handleStatusFilterSelect('all')} selected={statusFilter === 'all'}>
                            All
                          </MenuItem>
                          <MenuItem onClick={() => handleStatusFilterSelect('active')} selected={statusFilter === 'active'}>
                            Active
                          </MenuItem>
                          <MenuItem onClick={() => handleStatusFilterSelect('inactive')} selected={statusFilter === 'inactive'}>
                            Inactive
                          </MenuItem>
                        </Menu>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={() => handleSort('next_run')}>
                        Next Run
                        {sortColumn === 'next_run' ? (
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
                    <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={() => handleSort('last_run')}>
                        Last Run
                        {sortColumn === 'last_run' ? (
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
                    <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={() => handleSort('created')}>
                        Created
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
                    <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSchedules.length === 0 ? null : (
                    currentSchedules.map((schedule) => (
                    <TableRow 
                      key={schedule.id} 
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
                            title={schedule.name}
                          >
                            {schedule.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                        <Chip
                          label={getScheduleTypeLabel(schedule.schedule_type)}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            borderColor: '#E2E8F0',
                            color: '#1E293B',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                        <Chip
                          label={schedule.is_active ? 'Active' : 'Inactive'}
                          size="small"
                          color={schedule.is_active ? 'success' : 'default'}
                          variant={schedule.is_active ? 'filled' : 'outlined'}
                          sx={{ 
                            fontWeight: 600,
                            ...(schedule.is_active ? {
                              color: '#FFFFFF',
                              '& .MuiChip-label': { color: '#FFFFFF !important' }
                            } : { 
                              borderColor: '#E2E8F0',
                              color: '#1E293B',
                              backgroundColor: 'transparent'
                            })
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                        {schedule.next_run_at ? (
                          <TimeDisplay timestamp={schedule.next_run_at} format="datetime" />
                        ) : (
                          <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                            N/A
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                        {schedule.last_run_at ? (
                          <TimeDisplay timestamp={schedule.last_run_at} format="datetime" />
                        ) : (
                          <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                            Never
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                        <TimeDisplay timestamp={schedule.created_at} format="date" />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <ActionButton 
                            onClick={() => handleViewDetails(schedule)}
                            title="View Details"
                          >
                            <img src={viewIcon} alt="View" style={{ width: 20, height: 20 }} />
                          </ActionButton>
                          <ActionButton 
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            title="Delete Schedule"
                          >
                            <img src={deleteIcon} alt="Delete" style={{ width: 20, height: 20 }} />
                          </ActionButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      );
      })()}

      {(() => {
        // Apply filters to schedules (same logic as above)
        let filteredSchedules = schedules.filter(schedule => {
          // Schedule name filter
          if (filters.scheduleName && !schedule.name.toLowerCase().includes(filters.scheduleName.toLowerCase())) {
            return false;
          }
          // Type filter
          if (typeFilter !== 'all' && schedule.schedule_type !== typeFilter) {
            return false;
          }
          // Status filter
          if (statusFilter !== 'all') {
            const isActive = schedule.is_active;
            if (statusFilter === 'active' && !isActive) return false;
            if (statusFilter === 'inactive' && isActive) return false;
          }
          return true;
        });

        // Apply sorting
        if (sortColumn) {
          filteredSchedules = [...filteredSchedules].sort((a, b) => {
            let aValue: number;
            let bValue: number;
            
            if (sortColumn === 'next_run') {
              aValue = a.next_run_at ? new Date(a.next_run_at).getTime() : 0;
              bValue = b.next_run_at ? new Date(b.next_run_at).getTime() : 0;
            } else if (sortColumn === 'last_run') {
              aValue = a.last_run_at ? new Date(a.last_run_at).getTime() : 0;
              bValue = b.last_run_at ? new Date(b.last_run_at).getTime() : 0;
            } else { // created
              aValue = new Date(a.created_at).getTime();
              bValue = new Date(b.created_at).getTime();
            }
            
            if (sortDirection === 'asc') {
              return aValue - bValue;
            } else {
              return bValue - aValue;
            }
          });
        }

        const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        return filteredSchedules.length > itemsPerPage ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Stack spacing={2}>
              <Pagination 
                count={totalPages} 
                page={currentPage} 
                onChange={(_event, value) => setCurrentPage(value)} 
                color="primary" 
                size="large" 
                showFirstButton 
                showLastButton 
                sx={{ 
                  '& .MuiPaginationItem-root': { fontSize: '1rem', fontWeight: 500 }, 
                  '& .Mui-selected': { backgroundColor: '#6818A5', color: 'white', '&:hover': { backgroundColor: '#5a1594' } } 
                }} 
              />
              <Typography variant="body2" sx={{ textAlign: 'center', color: '#1E293B', fontWeight: 600 }}>
                Showing {startIndex + 1}-{Math.min(endIndex, filteredSchedules.length)} of {filteredSchedules.length} schedules
              </Typography>
            </Stack>
          </Box>
        ) : null;
      })()}

      {/* Schedule Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 1 }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon color="primary" />
            <Typography variant="h6">
              {selectedSchedule?.name}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedSchedule && (
            <Box>
              <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                <Box sx={{ flex: 1 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Schedule Information
                      </Typography>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                            Type
                          </Typography>
                          <Chip
                            label={getScheduleTypeLabel(selectedSchedule.schedule_type)}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: '#6818A5',
                              color: '#6818A5',
                              fontWeight: 600
                            }}
                          />
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                            Status
                          </Typography>
                          <Chip
                            label={selectedSchedule.is_active ? 'Active' : 'Inactive'}
                            size="small"
                            color={selectedSchedule.is_active ? 'success' : 'default'}
                            variant={selectedSchedule.is_active ? 'filled' : 'outlined'}
                            sx={{
                              fontWeight: 600,
                              ...(selectedSchedule.is_active ? {} : { 
                                borderColor: '#E2E8F0',
                                color: '#1E293B'
                              })
                            }}
                          />
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                            Created
                          </Typography>
                          <TimeDisplay timestamp={selectedSchedule.created_at} format="datetime" />
                        </Box>
                        {selectedSchedule.next_run_at && (
                          <Box>
                            <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                              Next Run
                            </Typography>
                            <TimeDisplay timestamp={selectedSchedule.next_run_at} format="datetime" />
                          </Box>
                        )}
                        {selectedSchedule.last_run_at && (
                          <Box>
                            <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                              Last Run
                            </Typography>
                            <TimeDisplay timestamp={selectedSchedule.last_run_at} format="datetime" />
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Scheduled Search Details
                      </Typography>
                      {searchDetailsLoading ? (
                        <LinearProgress />
                      ) : scheduledSearchDetails ? (
                        <Box>
                          {scheduledSearchDetails.type === 'collection' ? (
                            <Box>
                              <Typography variant="body2" sx={{ color: '#1E293B', mb: 1, fontWeight: 600 }}>
                                Collection: {(scheduledSearchDetails.data as any).name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#1E293B', mb: 1, fontWeight: 600 }}>
                                Description: {(scheduledSearchDetails.data as any).description || 'N/A'}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#1E293B', mb: 2, fontWeight: 600 }}>
                                Search Items: {(scheduledSearchDetails.data as any).collection_items?.length || 0}
                              </Typography>
                              {(scheduledSearchDetails.data as any).collection_items && (
                                <List dense>
                                  {(scheduledSearchDetails.data as any).collection_items.slice(0, 5).map((item: any, index: number) => (
                                    <ListItem key={index} sx={{ px: 0 }}>
                                      <ListItemText
                                        primary={`${item.location} - ${item.check_in_date} to ${item.check_out_date}`}
                                        secondary={`${item.adults} adults, ${item.star_rating} stars`}
                                      />
                                    </ListItem>
                                  ))}
                                </List>
                              )}
                            </Box>
                          ) : (
                            <Box>
                              <Typography variant="body2" sx={{ color: '#1E293B', mb: 1, fontWeight: 600 }}>
                                Search ID: {selectedSchedule.search_id}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#1E293B', mb: 1, fontWeight: 600 }}>
                                Job Name: {(scheduledSearchDetails.data as any).job_name || 'N/A'}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#1E293B', mb: 1, fontWeight: 600 }}>
                                Status: {(scheduledSearchDetails.data as any).status || 'N/A'}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ color: '#1E293B', textAlign: 'center', py: 2, fontWeight: 600 }}>
                          No search details available
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setDetailsOpen(false)} 
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

export default MySchedules;
