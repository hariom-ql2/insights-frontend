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
  Refresh as RefreshIcon,
  Person as PersonIcon,
  FolderOpen as FolderOpenIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { adminApi } from '../services/api';
import TimeDisplay from '../components/TimeDisplay';

interface Collection {
  id: number;
  user_id: string;
  name: string;
  description?: string;
  status: string;
  last_run_at?: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_email: string;
}

const AdminCollections: React.FC = () => {
  const { token, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCollections, setTotalCollections] = useState(0);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      setError('Admin access required');
      return;
    }
    const timeoutId = setTimeout(() => {
      loadCollections();
    }, userFilter ? 500 : 0); // Debounce user filter
    
    return () => clearTimeout(timeoutId);
  }, [isAdmin, page, statusFilter, userFilter]);

  const loadCollections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      if (userFilter) params.user_id = userFilter;
      
      const response = await adminApi.getCollections(params, token);
      if (response.success) {
        setCollections(response.data.collections);
        setTotalPages(response.data.pagination.totalPages);
        setTotalCollections(response.data.pagination.total);
      } else {
        setError(response.message || 'Failed to load collections');
      }
    } catch (err) {
      setError('Failed to load collections');
      console.error('Collections load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'running':
        return 'warning';
      case 'submitted':
        return 'info';
      case 'saved':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return <TimeDisplay timestamp={dateString} format="datetime" />;
  };


  if (!isAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Admin access required</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: 2, 
            bgcolor: '#f7fafc',
            border: '1px solid #e2e8f0'
          }}>
            <FolderOpenIcon sx={{ fontSize: 28, color: '#4a5568' }} />
          </Box>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#0F172A' }}>
              Collection Management
            </Typography>
            <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
              Manage and monitor data collections
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadCollections}
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
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="saved">Saved</MenuItem>
                <MenuItem value="submitted">Submitted</MenuItem>
                <MenuItem value="running">Running</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              placeholder="Filter by user email..."
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              sx={{ minWidth: 200 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120, fontWeight: 600 }}>
              Total: {totalCollections} collections
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Collections Table */}
      <Card sx={{ border: '1px solid #e2e8f0' }}>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>User</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Last Run</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Created</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {collections.map((collection) => (
                      <TableRow key={collection.id} hover>
                        <TableCell sx={{ maxWidth: 250 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, flexShrink: 0 }}>
                              {collection.user_name.charAt(0).toUpperCase()}
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
                                title={collection.user_name}
                              >
                                {collection.user_name}
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
                                title={collection.user_email}
                              >
                                {collection.user_email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 250 }}>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              fontWeight: 700, 
                              color: '#0F172A',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={collection.name}
                          >
                            {collection.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={collection.status}
                            color={getStatusColor(collection.status) as any}
                            size="small"
                            sx={{ 
                              fontWeight: 600,
                              '& .MuiChip-label': { color: '#FFFFFF' },
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                            {collection.last_run_at ? formatDate(collection.last_run_at) : 'Never'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                            {formatDate(collection.created_at)}
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
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminCollections;
