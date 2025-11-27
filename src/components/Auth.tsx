import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Container,
  Link,
  Tab,
  Tabs,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Auth = () => {
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSubmit = (_event: React.FormEvent) => {
    // Handle form submission
  };

  return (
    <Container maxWidth={false} sx={{ width: '100%', maxWidth: '100% !important', py: 4 }}>
      <Paper elevation={0} sx={{ 
        p: { xs: 3, sm: 4, md: 6 }, 
        borderRadius: 4,
        border: '1px solid rgba(0, 0, 0, 0.08)',
        maxWidth: '500px',
        mx: 'auto',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          align="center" 
          sx={{ 
            mb: 4,
            fontWeight: 700,
            background: 'linear-gradient(45deg, #2563EB 30%, #60A5FA 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Welcome to InsightInn
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            centered
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '1rem',
                textTransform: 'none',
                minWidth: 120,
              },
              '& .Mui-selected': {
                color: '#2563EB !important',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#2563EB',
              },
            }}
          >
            <Tab label="Login" />
            <Tab label="Sign Up" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    minHeight: '56px',
                  },
                }}
              />
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    minHeight: '56px',
                  },
                }}
              />
              <Link
                component="button"
                variant="body2"
                onClick={() => setTabValue(2)}
                sx={{
                  alignSelf: 'flex-end',
                  color: '#2563EB',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                Forgot password?
              </Link>
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(37, 99, 235, 0.3)',
                    backgroundColor: '#1E40AF',
                  },
                }}
              >
                Login
              </Button>
            </Box>
          </form>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Full Name"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    minHeight: '56px',
                  },
                }}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    minHeight: '56px',
                  },
                }}
              />
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    minHeight: '56px',
                  },
                }}
              />
              <TextField
                fullWidth
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    minHeight: '56px',
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(37, 99, 235, 0.3)',
                    backgroundColor: '#1E40AF',
                  },
                }}
              >
                Sign Up
              </Button>
            </Box>
          </form>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="body1" sx={{ mb: 2, color: '#64748B' }}>
                Enter your email address and we'll send you a link to reset your password.
              </Typography>
              <TextField
                fullWidth
                label="Email"
                type="email"
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    minHeight: '56px',
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(37, 99, 235, 0.3)',
                    backgroundColor: '#1E40AF',
                  },
                }}
              >
                Send Reset Link
              </Button>
              <Button
                onClick={() => setTabValue(0)}
                sx={{
                  mt: 1,
                  color: '#64748B',
                  '&:hover': {
                    backgroundColor: '#F1F5F9',
                  },
                }}
              >
                Back to Login
              </Button>
            </Box>
          </form>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default Auth; 