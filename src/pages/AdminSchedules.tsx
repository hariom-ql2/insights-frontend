import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Avatar,
} from '@mui/material';
import {
  Schedule as ScheduleIconMUI,
  Search as SearchIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { adminApi } from '../services/api';
import TimeDisplay from '../components/TimeDisplay';

interface Schedule {
  id: number;
  user_id: string;
  name: string;
  schedule_type: string;
  schedule_data: string;
  is_active: boolean;
  next_run_at?: string;
  last_run_at?: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
  collection_id?: number;
  search_id?: number;
}

const AdminSchedules: React.FC = () => {
  const { token, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      setError('Admin access required');
      return;
    }
    const timeoutId = setTimeout(() => {
      loadSchedules();
    }, search ? 500 : 0); // Debounce search
    
    return () => clearTimeout(timeoutId);
  }, [isAdmin, page, search, statusFilter]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getSchedules({
        page,
        limit: 10,
        user_id: search || undefined,
        status: statusFilter || undefined,
      }, token);

      if (response.success) {
        setSchedules(response.data.schedules || []);
        setTotalPages(response.data.total_pages || 1);
      } else {
        setError(response.message || 'Failed to load schedules');
      }
    } catch (err) {
      setError('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: 2, 
            bgcolor: '#f7fafc',
            border: '1px solid #e2e8f0'
          }}>
            <ScheduleIconMUI sx={{ fontSize: 28, color: '#4a5568' }} />
          </Box>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#0F172A' }}>
              Schedule Management
            </Typography>
            <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
              Monitor and manage scheduled tasks
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadSchedules}
          disabled={loading}
          sx={{
            borderRadius: 2,
            borderColor: '#4a5568',
            color: '#4a5568',
            '&:hover': {
              borderColor: '#2d3748',
              backgroundColor: '#f7fafc'
            }
          }}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3, border: '1px solid #e2e8f0' }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search by user email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Schedules Table */}
      <Card sx={{ border: '1px solid #e2e8f0' }}>
        <CardContent>
          <TableContainer>
            <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Schedule</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Next Run</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id} hover>
                    <TableCell sx={{ maxWidth: 250 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, flexShrink: 0 }}>
                          {(schedule.user_name || schedule.user_id).charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              fontWeight: 700, 
                              color: '#0F172A',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={schedule.user_name || schedule.user_id}
                          >
                            {schedule.user_name || schedule.user_id}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#1E293B', 
                              fontWeight: 600,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'block'
                            }}
                            title={schedule.user_email || schedule.user_id}
                          >
                            {schedule.user_email || schedule.user_id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 600, 
                          color: '#0F172A',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={schedule.name}
                      >
                        {schedule.name}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#1E293B', 
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'block'
                        }}
                        title={schedule.schedule_type}
                      >
                        {schedule.schedule_type}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'monospace', 
                          fontWeight: 600, 
                          color: '#0F172A',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={schedule.schedule_type}
                      >
                        {schedule.schedule_type}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: '#1E293B', 
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'block'
                        }}
                        title={schedule.schedule_data}
                      >
                        {schedule.schedule_data}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={schedule.is_active ? <PlayIcon /> : <PauseIcon />}
                        label={schedule.is_active ? 'Active' : 'Inactive'}
                        color={getStatusColor(schedule.is_active) as any}
                        size="small"
                        sx={{ 
                          fontWeight: 600,
                          '& .MuiChip-label': { color: '#FFFFFF' },
                          '& .MuiChip-icon': { color: '#FFFFFF' },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                        {schedule.next_run_at ? <TimeDisplay timestamp={schedule.next_run_at} format="datetime" /> : 'N/A'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminSchedules;
