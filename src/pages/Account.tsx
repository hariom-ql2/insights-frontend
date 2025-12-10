import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TimeDisplay from '../components/TimeDisplay';
import { apiService } from '../services/api';
import LockIcon from '@mui/icons-material/Lock';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CloseIcon from '@mui/icons-material/Close';
import editIcon from '../../icons/edit.svg';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  is_verified: boolean;
  city?: string;
  state?: string;
  country?: string;
  mobile_number?: string;
  timezone?: string;
  last_login_at?: string;
  created_at: string;
}

const getUserInitials = (name: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const Account = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [timezoneForm, setTimezoneForm] = useState({ timezone: '' });
  const [timezoneLoading, setTimezoneLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Modal states
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [timezoneModalOpen, setTimezoneModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    fetchProfile();
  }, [navigate, isAuthenticated]);

  const fetchProfile = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      if (data.success && data.user) {
        setProfile(data.user);
        setTimezoneForm({ timezone: data.user.timezone || '' });
      } else {
        setMessage({ type: 'error', text: 'Failed to load profile information' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error loading profile information' });
    } finally {
      setLoading(false);
    }
  };

  const handlePwSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return;
    }
    if (pwForm.next.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setPwLoading(true);
    setMessage(null);

    try {
      const data = await apiService.post('/change-password', {
        email: user?.email,
        current_password: pwForm.current,
        new_password: pwForm.next
      }, token);
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully' });
        setPwForm({ current: '', next: '', confirm: '' });
        setPasswordModalOpen(false);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to change password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error changing password' });
    } finally {
      setPwLoading(false);
    }
  };

  const handleTimezoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!timezoneForm.timezone) {
      setMessage({ type: 'error', text: 'Please select a timezone' });
      return;
    }

    setTimezoneLoading(true);
    setMessage(null);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
      const response = await fetch(`${API_BASE_URL}/auth/timezone`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(timezoneForm),
      });
      
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Timezone updated successfully' });
        // Update the profile state with new timezone
        if (profile) {
          setProfile({ ...profile, timezone: timezoneForm.timezone });
        }
        setTimezoneModalOpen(false);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update timezone' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating timezone' });
    } finally {
      setTimezoneLoading(false);
    }
  };

  const handleOpenPasswordModal = () => {
    setPwForm({ current: '', next: '', confirm: '' });
    setMessage(null);
    setPasswordModalOpen(true);
  };

  const handleOpenTimezoneModal = () => {
    setTimezoneForm({ timezone: profile?.timezone || '' });
    setMessage(null);
    setTimezoneModalOpen(true);
  };

  const formatLocation = () => {
    if (!profile) return '-';
    const parts = [profile.city, profile.state, profile.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : '-';
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', maxWidth: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Paper elevation={0} sx={{ 
        p: 4, 
        borderRadius: 2,
        border: '1px solid rgba(0, 0, 0, 0.08)',
        position: 'relative',
      }}>
        {/* Close Button */}
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: '#1E293B',
            '&:hover': {
              backgroundColor: '#F8FAFC'
            }
          }}
        >
          <CloseIcon />
        </IconButton>

        {message && (
          <Alert severity={message.type} sx={{ mb: 3, borderRadius: 2 }}>
            {message.text}
          </Alert>
        )}

        {/* Profile Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 4 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar sx={{ 
              bgcolor: '#6818A5', 
              width: 80, 
              height: 80,
              fontWeight: 600,
              color: '#FFFFFF',
              fontSize: '2rem'
            }}>
              {profile ? getUserInitials(profile.name) : 'U'}
            </Avatar>
            <IconButton
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: '#E5E5E5',
                width: 28,
                height: 28,
                border: '2px solid white',
                '&:hover': {
                  bgcolor: '#D1D5DB'
                }
              }}
            >
              <img src={editIcon} alt="Edit" style={{ width: 16, height: 16 }} />
            </IconButton>
          </Box>
          <Box sx={{ flex: 1, pt: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontFamily: '"Urbanist", sans-serif', mb: 0.5 }}>
              {profile?.name || '-'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
              {profile?.email || '-'}
            </Typography>
          </Box>
        </Box>

        {/* Profile Information */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#1E293B', fontWeight: 600 }}>
              Name
            </Typography>
            <Typography sx={{ color: '#1E293B', fontWeight: 600 }}>
              {profile?.name || '-'}
            </Typography>
          </Box>
          <Divider />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#1E293B', fontWeight: 600 }}>
              Email account
            </Typography>
            <Typography sx={{ color: '#1E293B', fontWeight: 600 }}>
              {profile?.email || '-'}
            </Typography>
          </Box>
          <Divider />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#1E293B', fontWeight: 600 }}>
              Mobile number
            </Typography>
            <Typography sx={{ color: '#1E293B', fontWeight: 600 }}>
              {profile?.mobile_number || '-'}
            </Typography>
          </Box>
          <Divider />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#1E293B', fontWeight: 600 }}>
              Location
            </Typography>
            <Typography sx={{ color: '#1E293B', fontWeight: 600 }}>
              {formatLocation()}
            </Typography>
          </Box>
          <Divider />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#1E293B', fontWeight: 600 }}>
              Last Login
            </Typography>
            <Typography sx={{ color: '#1E293B', fontWeight: 600 }}>
              {profile?.last_login_at ? <TimeDisplay timestamp={profile.last_login_at} format="datetime" /> : 'Never'}
            </Typography>
          </Box>
          <Divider />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#1E293B', fontWeight: 600 }}>
              Account created
            </Typography>
            <Typography sx={{ color: '#1E293B', fontWeight: 600 }}>
              {profile?.created_at ? <TimeDisplay timestamp={profile.created_at} format="date" /> : '-'}
            </Typography>
          </Box>
          <Divider />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
            <Typography variant="subtitle2" sx={{ color: '#1E293B', fontWeight: 600 }}>
              Email Status
            </Typography>
            <Typography sx={{ color: profile?.is_verified ? '#10B981' : '#EF4444', fontWeight: 600 }}>
              {profile?.is_verified ? 'Verified' : 'Not Verified'}
            </Typography>
          </Box>
        </Box>

        {/* Account Actions */}
        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #E5E7EB' }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<LockIcon />}
              onClick={handleOpenPasswordModal}
              sx={{
                background: '#FFFFFF',
                py: 1.5,
                px: 3,
                fontSize: '1rem',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                fontFamily: '"Urbanist", sans-serif',
                borderColor: '#6818A5',
                color: '#6818A5',
                '&:hover': {
                  background: '#F7F4FD',
                  borderColor: '#5a1594',
                  color: '#5a1594'
                },
              }}
            >
              Change Password
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<ScheduleIcon />}
              onClick={handleOpenTimezoneModal}
              sx={{
                background: '#FFFFFF',
                py: 1.5,
                px: 3,
                fontSize: '1rem',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                fontFamily: '"Urbanist", sans-serif',
                borderColor: '#6818A5',
                color: '#6818A5',
                '&:hover': {
                  background: '#F7F4FD',
                  borderColor: '#5a1594',
                  color: '#5a1594'
                },
              }}
            >
              Change Timezone
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Change Password Modal */}
      <Dialog 
        open={passwordModalOpen} 
        onClose={() => setPasswordModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 1 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LockIcon color="primary" />
            <Typography variant="h6" component="div">
              Change Password
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Enter your current password and choose a new one
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          {message && message.type === 'error' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handlePwSubmit}>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              value={pwForm.current}
              onChange={e => setPwForm({ ...pwForm, current: e.target.value })}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={pwForm.next}
              onChange={e => setPwForm({ ...pwForm, next: e.target.value })}
              sx={{ mb: 2 }}
              required
              helperText="Password must be at least 6 characters long"
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={pwForm.confirm}
              onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })}
              sx={{ mb: 2 }}
              required
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setPasswordModalOpen(false)} 
            color="inherit"
            // hover color #F8FAFC
            sx={{ borderRadius: 2, fontFamily: '"Urbanist", sans-serif', color: '#1E293B', '&:hover': { backgroundColor: '#F8FAFC' } }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handlePwSubmit}
            variant="contained" 
            disabled={pwLoading}
            sx={{
              backgroundColor: '#DC2626',
              borderRadius: 2,
              '&:hover': {
                backgroundColor: '#B91C1C',
              },
              fontFamily: '"Urbanist", sans-serif'
            }}
          >
            {pwLoading ? 'Updating...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Timezone Modal */}
      <Dialog 
        open={timezoneModalOpen} 
        onClose={() => setTimezoneModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 1 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon color="primary" />
            <Typography variant="h6" component="div">
              Change Timezone
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Select your preferred timezone for scheduling
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          {message && message.type === 'error' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleTimezoneSubmit}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Timezone</InputLabel>
              <Select
                value={timezoneForm.timezone}
                onChange={e => setTimezoneForm({ timezone: e.target.value })}
                label="Select Timezone"
                required
              >
                {/* UTC */}
                <MenuItem value="UTC">UTC (Coordinated Universal Time) - UTC+00:00</MenuItem>
                
                {/* North America */}
                <MenuItem value="America/New_York">America/New_York (Eastern Time) - UTC-05:00/-04:00</MenuItem>
                <MenuItem value="America/Chicago">America/Chicago (Central Time) - UTC-06:00/-05:00</MenuItem>
                <MenuItem value="America/Denver">America/Denver (Mountain Time) - UTC-07:00/-06:00</MenuItem>
                <MenuItem value="America/Los_Angeles">America/Los_Angeles (Pacific Time) - UTC-08:00/-07:00</MenuItem>
                <MenuItem value="America/Anchorage">America/Anchorage (Alaska Time) - UTC-09:00/-08:00</MenuItem>
                <MenuItem value="Pacific/Honolulu">Pacific/Honolulu (Hawaii Time) - UTC-10:00</MenuItem>
                <MenuItem value="America/Toronto">America/Toronto (Eastern Time) - UTC-05:00/-04:00</MenuItem>
                <MenuItem value="America/Vancouver">America/Vancouver (Pacific Time) - UTC-08:00/-07:00</MenuItem>
                <MenuItem value="America/Mexico_City">America/Mexico_City (Central Time) - UTC-06:00/-05:00</MenuItem>
                
                {/* Europe */}
                <MenuItem value="Europe/London">Europe/London (GMT/BST) - UTC+00:00/+01:00</MenuItem>
                <MenuItem value="Europe/Paris">Europe/Paris (CET/CEST) - UTC+01:00/+02:00</MenuItem>
                <MenuItem value="Europe/Berlin">Europe/Berlin (CET/CEST) - UTC+01:00/+02:00</MenuItem>
                <MenuItem value="Europe/Rome">Europe/Rome (CET/CEST) - UTC+01:00/+02:00</MenuItem>
                <MenuItem value="Europe/Madrid">Europe/Madrid (CET/CEST) - UTC+01:00/+02:00</MenuItem>
                <MenuItem value="Europe/Amsterdam">Europe/Amsterdam (CET/CEST) - UTC+01:00/+02:00</MenuItem>
                <MenuItem value="Europe/Stockholm">Europe/Stockholm (CET/CEST) - UTC+01:00/+02:00</MenuItem>
                <MenuItem value="Europe/Vienna">Europe/Vienna (CET/CEST) - UTC+01:00/+02:00</MenuItem>
                <MenuItem value="Europe/Zurich">Europe/Zurich (CET/CEST) - UTC+01:00/+02:00</MenuItem>
                <MenuItem value="Europe/Moscow">Europe/Moscow (MSK) - UTC+03:00</MenuItem>
                <MenuItem value="Europe/Istanbul">Europe/Istanbul (TRT) - UTC+03:00</MenuItem>
                
                {/* Asia */}
                <MenuItem value="Asia/Kolkata">Asia/Kolkata (Indian Standard Time) - UTC+05:30</MenuItem>
                <MenuItem value="Asia/Tokyo">Asia/Tokyo (Japan Standard Time) - UTC+09:00</MenuItem>
                <MenuItem value="Asia/Shanghai">Asia/Shanghai (China Standard Time) - UTC+08:00</MenuItem>
                <MenuItem value="Asia/Hong_Kong">Asia/Hong_Kong (Hong Kong Time) - UTC+08:00</MenuItem>
                <MenuItem value="Asia/Singapore">Asia/Singapore (Singapore Time) - UTC+08:00</MenuItem>
                <MenuItem value="Asia/Seoul">Asia/Seoul (Korea Standard Time) - UTC+09:00</MenuItem>
                <MenuItem value="Asia/Bangkok">Asia/Bangkok (Indochina Time) - UTC+07:00</MenuItem>
                <MenuItem value="Asia/Jakarta">Asia/Jakarta (Western Indonesia Time) - UTC+07:00</MenuItem>
                <MenuItem value="Asia/Manila">Asia/Manila (Philippine Time) - UTC+08:00</MenuItem>
                <MenuItem value="Asia/Karachi">Asia/Karachi (Pakistan Standard Time) - UTC+05:00</MenuItem>
                <MenuItem value="Asia/Dubai">Asia/Dubai (Gulf Standard Time) - UTC+04:00</MenuItem>
                <MenuItem value="Asia/Tehran">Asia/Tehran (Iran Standard Time) - UTC+03:30</MenuItem>
                <MenuItem value="Asia/Riyadh">Asia/Riyadh (Arabia Standard Time) - UTC+03:00</MenuItem>
                <MenuItem value="Asia/Kathmandu">Asia/Kathmandu (Nepal Time) - UTC+05:45</MenuItem>
                <MenuItem value="Asia/Dhaka">Asia/Dhaka (Bangladesh Standard Time) - UTC+06:00</MenuItem>
                
                {/* Australia & Oceania */}
                <MenuItem value="Australia/Sydney">Australia/Sydney (Australian Eastern Time) - UTC+10:00/+11:00</MenuItem>
                <MenuItem value="Australia/Melbourne">Australia/Melbourne (Australian Eastern Time) - UTC+10:00/+11:00</MenuItem>
                <MenuItem value="Australia/Brisbane">Australia/Brisbane (Australian Eastern Time) - UTC+10:00</MenuItem>
                <MenuItem value="Australia/Perth">Australia/Perth (Australian Western Time) - UTC+08:00</MenuItem>
                <MenuItem value="Australia/Adelaide">Australia/Adelaide (Australian Central Time) - UTC+09:30/+10:30</MenuItem>
                <MenuItem value="Pacific/Auckland">Pacific/Auckland (New Zealand Time) - UTC+12:00/+13:00</MenuItem>
                <MenuItem value="Pacific/Fiji">Pacific/Fiji (Fiji Time) - UTC+12:00</MenuItem>
                
                {/* South America */}
                <MenuItem value="America/Sao_Paulo">America/Sao_Paulo (Brasilia Time) - UTC-03:00</MenuItem>
                <MenuItem value="America/Buenos_Aires">America/Buenos_Aires (Argentina Time) - UTC-03:00</MenuItem>
                <MenuItem value="America/Lima">America/Lima (Peru Time) - UTC-05:00</MenuItem>
                <MenuItem value="America/Bogota">America/Bogota (Colombia Time) - UTC-05:00</MenuItem>
                <MenuItem value="America/Caracas">America/Caracas (Venezuela Time) - UTC-04:00</MenuItem>
                <MenuItem value="America/Santiago">America/Santiago (Chile Time) - UTC-03:00/-04:00</MenuItem>
                
                {/* Africa */}
                <MenuItem value="Africa/Cairo">Africa/Cairo (Eastern European Time) - UTC+02:00</MenuItem>
                <MenuItem value="Africa/Johannesburg">Africa/Johannesburg (South Africa Time) - UTC+02:00</MenuItem>
                <MenuItem value="Africa/Lagos">Africa/Lagos (West Africa Time) - UTC+01:00</MenuItem>
                <MenuItem value="Africa/Casablanca">Africa/Casablanca (Western European Time) - UTC+00:00/+01:00</MenuItem>
                <MenuItem value="Africa/Nairobi">Africa/Nairobi (East Africa Time) - UTC+03:00</MenuItem>
                <MenuItem value="Africa/Addis_Ababa">Africa/Addis_Ababa (East Africa Time) - UTC+03:00</MenuItem>
                
                {/* Additional Major Cities */}
                <MenuItem value="Asia/Taipei">Asia/Taipei (Taiwan Time) - UTC+08:00</MenuItem>
                <MenuItem value="Asia/Kuala_Lumpur">Asia/Kuala_Lumpur (Malaysia Time) - UTC+08:00</MenuItem>
                <MenuItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (Indochina Time) - UTC+07:00</MenuItem>
                <MenuItem value="Asia/Rangoon">Asia/Rangoon (Myanmar Time) - UTC+06:30</MenuItem>
                <MenuItem value="Asia/Almaty">Asia/Almaty (Almaty Time) - UTC+06:00</MenuItem>
                <MenuItem value="Asia/Tashkent">Asia/Tashkent (Uzbekistan Time) - UTC+05:00</MenuItem>
                <MenuItem value="Asia/Yekaterinburg">Asia/Yekaterinburg (Yekaterinburg Time) - UTC+05:00</MenuItem>
                <MenuItem value="Asia/Novosibirsk">Asia/Novosibirsk (Novosibirsk Time) - UTC+07:00</MenuItem>
                <MenuItem value="Asia/Vladivostok">Asia/Vladivostok (Vladivostok Time) - UTC+10:00</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setTimezoneModalOpen(false)} 
            color="inherit"
            sx={{ borderRadius: 2, fontFamily: '"Urbanist", sans-serif', '&:hover': { backgroundColor: '#F8FAFC' } }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleTimezoneSubmit}
            variant="contained" 
            disabled={timezoneLoading}
            sx={{
              backgroundColor: '#7C3AED',
              borderRadius: 2,
              '&:hover': {
                backgroundColor: '#6D28D9',
              },
              fontFamily: '"Urbanist", sans-serif'
            }}
          >
            {timezoneLoading ? 'Updating...' : 'Update Timezone'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Account;
