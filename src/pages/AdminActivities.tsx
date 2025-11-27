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
  // IconButton,
  // Tooltip,
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
  Paper,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Computer as ComputerIcon,
  LocationOn as LocationIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { adminApi } from '../services/api';
import TimeDisplay from '../components/TimeDisplay';

interface Activity {
  id: number;
  admin_id: number;
  action: string;
  resource: string;
  resource_id?: number;
  details: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  admin_name: string;
  admin_email: string;
}

const AdminActivities: React.FC = () => {
  const { token, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalActivities, setTotalActivities] = useState(0);
  
  // Filter states
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [adminFilter, setAdminFilter] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      setError('Admin access required');
      return;
    }
    const timeoutId = setTimeout(() => {
      loadActivities();
    }, adminFilter ? 500 : 0); // Debounce admin filter
    
    return () => clearTimeout(timeoutId);
  }, [isAdmin, page, actionFilter, resourceFilter, adminFilter]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = { page, limit: 20 };
      if (actionFilter) params.action = actionFilter;
      if (resourceFilter) params.resource = resourceFilter;
      if (adminFilter) params.admin_id = parseInt(adminFilter);
      
      const response = await adminApi.getActivities(params, token);
      if (response.success) {
        setActivities(response.data.activities);
        setTotalPages(response.data.pagination.totalPages);
        setTotalActivities(response.data.pagination.total);
      } else {
        setError(response.message || 'Failed to load activities');
      }
    } catch (err) {
      setError('Failed to load activities');
      console.error('Activities load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'success';
      case 'update':
        return 'warning';
      case 'delete':
        return 'error';
      case 'view':
        return 'info';
      default:
        return 'default';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return <AddIcon />;
      case 'update':
        return <EditIcon />;
      case 'delete':
        return <DeleteIcon />;
      case 'view':
        return <VisibilityIcon />;
      default:
        return <VisibilityIcon />;
    }
  };

  const formatDate = (dateString: string) => {
    return <TimeDisplay timestamp={dateString} format="datetime" />;
  };

  const parseUserAgent = (userAgent: string) => {
    // Simple user agent parsing
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown Browser';
  };

  const parseDetails = (details: string) => {
    try {
      return JSON.parse(details);
    } catch {
      return details;
    }
  };

  const getPastTense = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower === 'view') return 'viewed';
    if (actionLower === 'create') return 'created';
    if (actionLower === 'update') return 'updated';
    if (actionLower === 'delete') return 'deleted';
    return `${action}d`;
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
            <TimelineIcon sx={{ fontSize: 28, color: '#4a5568' }} />
          </Box>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#0F172A' }}>
              Activity Log
            </Typography>
            <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
              Monitor admin activities and system events
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadActivities}
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
              <InputLabel>Action</InputLabel>
              <Select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                label="Action"
              >
                <MenuItem value="">All Actions</MenuItem>
                <MenuItem value="create">Create</MenuItem>
                <MenuItem value="update">Update</MenuItem>
                <MenuItem value="delete">Delete</MenuItem>
                <MenuItem value="view">View</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Resource</InputLabel>
              <Select
                value={resourceFilter}
                onChange={(e) => setResourceFilter(e.target.value)}
                label="Resource"
              >
                <MenuItem value="">All Resources</MenuItem>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="search">Search</MenuItem>
                <MenuItem value="collection">Collection</MenuItem>
                <MenuItem value="dashboard">Dashboard</MenuItem>
                <MenuItem value="activities">Activities</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              placeholder="Admin ID..."
              value={adminFilter}
              onChange={(e) => setAdminFilter(e.target.value)}
              sx={{ minWidth: 150 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120, fontWeight: 600 }}>
              Total: {totalActivities} activities
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Activities Table */}
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
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Admin/User</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Action</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Resource</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Details</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>IP Address</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Browser</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Timestamp</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activities.map((activity) => (
                      <TableRow 
                        key={activity.id} 
                        hover
                        sx={{
                          '&:hover': {
                            backgroundColor: '#f8fafc',
                          }
                        }}
                      >
                        <TableCell sx={{ maxWidth: 250 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, flexShrink: 0 }}>
                              {activity.admin_name.charAt(0).toUpperCase()}
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
                                title={activity.admin_name}
                              >
                                {activity.admin_name}
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
                                title={activity.admin_email}
                              >
                                {activity.admin_email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getActionIcon(activity.action)}
                            label={activity.action}
                            color={getActionColor(activity.action) as any}
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
                            {activity.resource}
                            {activity.resource_id && (
                              <Typography variant="caption" sx={{ color: '#1E293B', fontWeight: 600 }} display="block">
                                ID: {activity.resource_id}
                              </Typography>
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 200 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis', 
                              whiteSpace: 'nowrap',
                              fontWeight: 600, 
                              color: '#0F172A' 
                            }}
                            title={activity.details}
                          >
                            {activity.details}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationIcon fontSize="small" color="action" />
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                              {activity.ip_address}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ComputerIcon fontSize="small" color="action" />
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                              {parseUserAgent(activity.user_agent)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                            {formatDate(activity.created_at)}
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

      {/* Activity Details Accordion */}
      {activities.length > 0 && (
        <Card sx={{ mt: 3, border: '1px solid #e2e8f0' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Activity Details
            </Typography>
            {activities.slice(0, 5).map((activity) => (
              <Accordion key={activity.id}>
                <AccordionSummary 
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    '&:hover': {
                      backgroundColor: '#f7f4fd',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <Chip
                      icon={getActionIcon(activity.action)}
                      label={activity.action}
                      color={getActionColor(activity.action) as any}
                      size="small"
                      sx={{ 
                        fontWeight: 600,
                        '& .MuiChip-label': { color: '#FFFFFF' },
                        '& .MuiChip-icon': { color: '#FFFFFF' },
                      }}
                    />
                    <Typography variant="body2">
                      {activity.admin_name} {getPastTense(activity.action)} {activity.resource}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ ml: 'auto' }}>
                      {formatDate(activity.created_at)}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: 1, minWidth: 300 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Activity Details:
                      </Typography>
                      <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                        <pre style={{ margin: 0, fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                          {JSON.stringify(parseDetails(activity.details), null, 2)}
                        </pre>
                      </Paper>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 300 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Technical Details:
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="body2">
                          <strong>IP Address:</strong> {activity.ip_address}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Browser:</strong> {parseUserAgent(activity.user_agent)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>User Agent:</strong> {activity.user_agent}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Resource ID:</strong> {activity.resource_id || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AdminActivities;
