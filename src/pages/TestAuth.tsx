import { useState } from 'react';
import { Box, Button, Typography, TextField, Alert, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import TimeDisplay from '../components/TimeDisplay';

const TestAuth = () => {
  const { login, logout, user, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('test2@example.com');
  const [password, setPassword] = useState('Password123!');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    const result = await login(email, password);
    setMessage(result.message);
  };

  const handleLogout = async () => {
    await logout();
    setMessage('Logged out successfully');
  };

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Authentication Test
        </Typography>
        
        {message && (
          <Alert severity={isAuthenticated ? "success" : "info"} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {isAuthenticated ? (
          <Box>
            <Typography variant="h6" gutterBottom>
              Welcome, {user?.name}!
            </Typography>
            <Typography variant="body1" gutterBottom>
              Email: {user?.email}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Last Login: {user?.last_login_at ? <TimeDisplay timestamp={user.last_login_at} format="datetime" /> : 'Never'}
            </Typography>
            <Button variant="contained" onClick={handleLogout} sx={{ mt: 2 }}>
              Logout
            </Button>
          </Box>
        ) : (
          <Box>
            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" onClick={handleLogin}>
              Login
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default TestAuth;
