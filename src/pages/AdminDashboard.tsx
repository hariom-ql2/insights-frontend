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
  IconButton,
  Alert,
  CircularProgress,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
  Visibility as VisibilityIcon,
  Group as GroupIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { adminApi } from '../services/api';

interface DashboardStats {
  total_users: number;
  active_users: number;
  new_users_today: number;
  total_searches: number;
  total_collections: number;
  total_schedules: number;
  failed_jobs: number;
  completed_jobs: number;
  revenue: number;
}

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  is_verified: boolean;
  created_at: string;
  last_login_at?: string;
  searches_count: number;
  collections_count: number;
  schedules_count: number;
}

interface Search {
  id: number;
  user_id: string;
  job_name?: string;
  timestamp: string;
  status: string;
  scheduled: boolean;
  created_at: string;
  user_name: string;
  user_email: string;
}

interface Collection {
  id: number;
  user_id: string;
  name: string;
  description?: string;
  status: string;
  created_at: string;
  user_name: string;
  user_email: string;
}

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
      borderRadius: 1.5,
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

const AdminDashboard: React.FC = () => {
  const { token, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [searches, setSearches] = useState<Search[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userEditData, setUserEditData] = useState<Partial<User>>({});

  useEffect(() => {
    if (!isAdmin) {
      setError('Admin access required');
      return;
    }
    loadDashboardData();
  }, [isAdmin]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load dashboard stats
      const statsResponse = await adminApi.getDashboardStats(token);
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
      
      // Load recent users
      const usersResponse = await adminApi.getUsers({ page: 1, limit: 10 }, token);
      if (usersResponse.success) {
        setUsers(usersResponse.data.users);
      }
      
      // Load recent searches
      const searchesResponse = await adminApi.getSearches({ page: 1, limit: 10 }, token);
      if (searchesResponse.success) {
        setSearches(searchesResponse.data.searches);
      }
      
      // Load recent collections
      const collectionsResponse = await adminApi.getCollections({ page: 1, limit: 10 }, token);
      if (collectionsResponse.success) {
        setCollections(collectionsResponse.data.collections);
      }
      
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  const handleUserEdit = (user: User) => {
    setSelectedUser(user);
    setUserEditData({
      name: user.name,
      role: user.role,
      is_verified: user.is_verified,
    });
    setUserDialogOpen(true);
  };

  const handleUserUpdate = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await adminApi.updateUser(selectedUser.id, userEditData, token);
      if (response.success) {
        setUserDialogOpen(false);
        loadDashboardData(); // Refresh data
      } else {
        setError(response.message || 'Failed to update user');
      }
    } catch (err) {
      setError('Failed to update user');
      console.error('User update error:', err);
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
      case 'starting':
        return 'info';
      case 'submitted':
        return 'info';
      case 'executing':
        return 'info';
      default:
        return 'default';
    }
  };

  if (!isAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Admin access required</Alert>
      </Box>
    );
  }

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
            <DashboardIcon sx={{ fontSize: 28, color: '#4a5568' }} />
          </Box>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#0F172A' }}>
              Admin Dashboard
            </Typography>
            <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
              Monitor your application performance and user activity
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
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

      {/* Stats Cards */}
      {stats && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
          {/* Total Users Card */}
          <Card sx={{ 
            height: '100%',
            border: '1px solid #e2e8f0'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ 
                    mb: 1, 
                    color: '#1E293B',
                    fontWeight: 700
                  }}>
                    Total Users
                  </Typography>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800, 
                    mb: 1, 
                    color: '#0F172A'
                  }}>
                    {stats.total_users}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: '#6818A5',
                    fontWeight: 600
                  }}>
                    <PersonAddIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    +{stats.new_users_today} today
                  </Typography>
                </Box>
                <Avatar sx={{ 
                  bgcolor: '#F7F4FD', 
                  width: 60, 
                  height: 60,
                  border: '2px solid #6818A5'
                }}>
                  <GroupIcon sx={{ fontSize: 30, color: '#6818A5' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>

          {/* Active Users Card */}
          <Card sx={{ 
            height: '100%',
            border: '1px solid #e2e8f0'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ 
                    mb: 1, 
                    color: '#1E293B',
                    fontWeight: 700
                  }}>
                    Active Users
                  </Typography>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800, 
                    mb: 1, 
                    color: '#0F172A'
                  }}>
                    {stats.active_users}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(stats.active_users / stats.total_users) * 100} 
                      sx={{ 
                        flex: 1, 
                        height: 6, 
                        borderRadius: 3,
                        bgcolor: '#F7F4FD',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: '#6818A5',
                          borderRadius: 3
                        }
                      }} 
                    />
                    <Typography variant="caption" sx={{ 
                      color: '#6818A5',
                      fontWeight: 600
                    }}>
                      {Math.round((stats.active_users / stats.total_users) * 100)}%
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ 
                  bgcolor: '#F7F4FD', 
                  width: 60, 
                  height: 60,
                  border: '2px solid #6818A5'
                }}>
                  <PeopleIcon sx={{ fontSize: 30, color: '#6818A5' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>

          {/* Total Searches Card */}
          <Card sx={{ 
            height: '100%',
            border: '1px solid #e2e8f0'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ 
                    mb: 1, 
                    color: '#1E293B',
                    fontWeight: 700
                  }}>
                    Total Searches
                  </Typography>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800, 
                    mb: 1, 
                    color: '#0F172A'
                  }}>
                    {stats.total_searches}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: '#FACC15',
                    fontWeight: 600
                  }}>
                    <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    {stats.completed_jobs} completed
                  </Typography>
                </Box>
                <Avatar sx={{ 
                  bgcolor: '#F7F4FD', 
                  width: 60, 
                  height: 60,
                  border: '2px solid #6818A5'
                }}>
                  <SearchIcon sx={{ fontSize: 30, color: '#6818A5' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>

          {/* Revenue Card */}
          <Card sx={{ 
            height: '100%',
            border: '1px solid #e2e8f0'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" sx={{ 
                    mb: 1, 
                    color: '#1E293B',
                    fontWeight: 700
                  }}>
                    Revenue
                  </Typography>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800, 
                    mb: 1, 
                    color: '#0F172A'
                  }}>
                    $3785
                    {/* ${stats.revenue.toLocaleString()} */}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: '#059669',
                    fontWeight: 600
                  }}>
                    <MoneyIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    This month
                  </Typography>
                </Box>
                <Avatar sx={{ 
                  bgcolor: '#F7F4FD', 
                  width: 60, 
                  height: 60,
                  border: '2px solid #6818A5'
                }}>
                  <MoneyIcon sx={{ fontSize: 30, color: '#6818A5' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Data Tables Section */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Recent Users */}
        <Card sx={{ border: '1px solid #e2e8f0' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 800, color: '#0F172A' }}>
              Recent Users
            </Typography>
            
            <TableContainer>
              <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.slice(0, 5).map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell sx={{ maxWidth: 250 }}>
                        <Box>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 700, 
                              color: '#0F172A',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={user.name}
                          >
                            {user.name}
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
                            title={user.email}
                          >
                            {user.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.is_verified ? 'Verified' : 'Pending'} 
                          color={user.is_verified ? 'success' : 'warning'} 
                          size="small"
                          sx={{ 
                            fontWeight: 600,
                            '& .MuiChip-label': { color: '#FFFFFF' },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <ActionButton 
                          onClick={() => handleUserEdit(user)}
                          title="Edit User"
                        >
                          <EditIcon fontSize="small" />
                        </ActionButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Recent Searches */}
        <Card sx={{ border: '1px solid #e2e8f0' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 800, color: '#0F172A' }}>
              Recent Searches
            </Typography>
            
            <TableContainer>
              <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {searches.slice(0, 5).map((search) => (
                    <TableRow key={search.id} hover>
                      <TableCell sx={{ maxWidth: 250 }}>
                        <Box>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 600, 
                              color: '#0F172A',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={search.user_name}
                          >
                            {search.user_name}
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
                            title={search.job_name || 'Search Job'}
                          >
                            {search.job_name || 'Search Job'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={search.status} 
                          color={getStatusColor(search.status) as any} 
                          size="small"
                          sx={{ 
                            fontWeight: 600,
                            '& .MuiChip-label': { color: '#FFFFFF' },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <ActionButton 
                          onClick={() => {}}
                          title="View Details"
                        >
                          <VisibilityIcon fontSize="small" />
                        </ActionButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Recent Collections */}
        <Card sx={{ border: '1px solid #e2e8f0' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 800, color: '#0F172A' }}>
              Recent Collections
            </Typography>
            
            <TableContainer>
              <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Collection</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {collections.slice(0, 5).map((collection) => (
                    <TableRow key={collection.id} hover>
                      <TableCell sx={{ maxWidth: 250 }}>
                        <Box>
                          <Typography 
                            variant="body2" 
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
                            title={collection.user_name}
                          >
                            {collection.user_name}
                          </Typography>
                        </Box>
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
                        <ActionButton 
                          onClick={() => {}}
                          title="View Details"
                        >
                          <VisibilityIcon fontSize="small" />
                        </ActionButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      {/* User Edit Dialog */}
      <Dialog 
        open={userDialogOpen} 
        onClose={() => setUserDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', pb: 2 }}>
          Edit User
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              fullWidth
              label="Name"
              value={userEditData.name || ''}
              onChange={(e) => setUserEditData({ ...userEditData, name: e.target.value })}
            />

            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={userEditData.role || ''}
                onChange={(e) => setUserEditData({ ...userEditData, role: e.target.value })}
                label="Role"
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={userEditData.is_verified || false}
                  onChange={(e) => setUserEditData({ ...userEditData, is_verified: e.target.checked })}
                />
              }
              label="Verified User"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setUserDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUserUpdate} variant="contained">
            Update User
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;