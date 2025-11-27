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
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  VerifiedUser as VerifiedUserIcon,
  AdminPanelSettings as AdminIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { adminApi } from '../services/api';
import TimeDisplay from '../components/TimeDisplay';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  is_verified: boolean;
  city?: string;
  state?: string;
  country?: string;
  mobile_number?: string;
  timezone?: string;
  last_login_at?: string;
  created_at: string;
  searches_count: number;
  collections_count: number;
  schedules_count: number;
}

const AdminUsers: React.FC = () => {
  const { token, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Filter states
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      setError('Admin access required');
      return;
    }
    const timeoutId = setTimeout(() => {
      loadUsers();
    }, search ? 500 : 0); // Debounce search
    
    return () => clearTimeout(timeoutId);
  }, [isAdmin, page, search, roleFilter, verifiedFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (verifiedFilter) params.verified = verifiedFilter === 'true';
      
      const response = await adminApi.getUsers(params, token);
      if (response.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.pagination.totalPages);
        setTotalUsers(response.data.pagination.total);
      } else {
        setError(response.message || 'Failed to load users');
      }
    } catch (err) {
      setError('Failed to load users');
      console.error('Users load error:', err);
    } finally {
      setLoading(false);
    }
  };



  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'error';
      case 'admin':
        return 'warning';
      case 'user':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return <AdminIcon />;
      default:
        return <PersonIcon />;
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
            <GroupIcon sx={{ fontSize: 28, color: '#4a5568' }} />
          </Box>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#0F172A' }}>
              User Management
            </Typography>
            <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
              Manage and monitor user accounts
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadUsers}
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
              fullWidth
              size="small"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 200 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                label="Role"
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="super_admin">Super Admin</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Verification</InputLabel>
              <Select
                value={verifiedFilter}
                onChange={(e) => setVerifiedFilter(e.target.value)}
                label="Verification"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Verified</MenuItem>
                <MenuItem value="false">Unverified</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" color="textSecondary" sx={{ minWidth: 120, fontWeight: 600 }}>
              Total: {totalUsers} users
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
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
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Last Login</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Created</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell sx={{ maxWidth: 300 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', flexShrink: 0 }}>
                              {user.name.charAt(0).toUpperCase()}
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
                                title={user.name}
                              >
                                {user.name}
                              </Typography>
                              <Typography 
                                variant="body2" 
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
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getRoleIcon(user.role)}
                            label={user.role.replace('_', ' ')}
                            color={getRoleColor(user.role) as any}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              backgroundColor: user.role === 'super_admin' ? '#dc2626' : 
                                               user.role === 'admin' ? '#f59e0b' : '#3b82f6',
                              '& .MuiChip-label': { color: '#FFFFFF' },
                              '& .MuiChip-icon': { color: '#FFFFFF' },
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={user.is_verified ? <VerifiedUserIcon /> : undefined}
                            label={user.is_verified ? 'Verified' : 'Unverified'}
                            color={user.is_verified ? 'success' : 'error'}
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
                            {user.last_login_at ? formatDate(user.last_login_at) : 'Never'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                            {formatDate(user.created_at)}
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

export default AdminUsers;
