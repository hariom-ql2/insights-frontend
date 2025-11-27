import React, { useState } from 'react';
import { Typography, Box, TextField, Button, Link, Alert, Stepper, Step, StepLabel, StepConnector } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import PaymentIcon from '@mui/icons-material/Payment';

const CustomStepConnector = styled(StepConnector)(() => ({
  '&.Mui-active .MuiStepConnector-line': {
    backgroundColor: '#6818A5',
  },
  '&.Mui-completed .MuiStepConnector-line': {
    backgroundColor: '#6818A5',
  },
  '& .MuiStepConnector-line': {
    height: 2,
    border: 0,
    backgroundColor: '#E5E5E5',
    borderRadius: 1,
  },
}));

const CustomStepIcon = styled('div')<{ ownerState: { active?: boolean; completed?: boolean } }>(({ ownerState }) => ({
  backgroundColor: ownerState.completed ? '#6818A5' : ownerState.active ? '#6818A5' : '#E5E5E5',
  zIndex: 1,
  color: '#fff',
  width: 40,
  height: 40,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '16px',
  fontWeight: 600,
}));

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { login, isAuthenticated, isAdmin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.email || !formData.password) {
      setError('All fields are required.');
      return;
    }
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      // Redirect admin users to admin dashboard, regular users to home
      if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } else {
      if (result.message.includes('verify your email')) {
        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      } else {
        setError(result.message);
      }
    }
  };

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      // Redirect admin users to admin dashboard, regular users to home
      if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, isAdmin, navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#F6F9FF',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
        {/* Motto Section */}
        <Box sx={{ textAlign: 'center', mb: 4, maxWidth: '800px', px: 2 }}>
          <Typography 
            variant="h2" 
            sx={{ 
              fontWeight: 800,
              color: '#232323',
              fontFamily: '"Urbanist", sans-serif',
              mb: 2,
              fontSize: { xs: '2rem', sm: '3rem' },
              lineHeight: 1.2
            }}
          >
            <span style={{ color: '#6818A5' }}>Right insight</span> at the <span style={{ color: '#6818A5' }}>Right time</span> leads to a <span style={{ color: '#6818A5' }}>Better Decision</span>
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#1E293B',
              fontFamily: '"Urbanist", sans-serif',
              fontWeight: 600
            }}
          >
            Set up privacy-friendly analytics with just a few clicks
          </Typography>
        </Box>

        {/* Progress Indicator */}
        <Box sx={{ mb: 6, width: '100%', maxWidth: '600px', px: 2 }}>
          <Stepper activeStep={1} connector={<CustomStepConnector />}>
            <Step>
              <StepLabel
                StepIconComponent={(props) => (
                  <CustomStepIcon ownerState={props}>
                    <CheckCircleIcon />
                  </CustomStepIcon>
                )}
                sx={{
                  '& .MuiStepLabel-label': {
                    color: '#232323',
                    fontFamily: '"Urbanist", sans-serif',
                    fontWeight: 600
                  }
                }}
              >
                Create An Account
              </StepLabel>
            </Step>
            <Step>
              <StepLabel
                StepIconComponent={(props) => (
                  <CustomStepIcon ownerState={props}>
                    <PersonIcon />
                  </CustomStepIcon>
                )}
                sx={{
                  '& .MuiStepLabel-label': {
                    color: '#232323',
                    fontFamily: '"Urbanist", sans-serif',
                    fontWeight: 600
                  }
                }}
              >
                Enter Your Information
              </StepLabel>
            </Step>
            <Step>
              <StepLabel
                StepIconComponent={(props) => (
                  <CustomStepIcon ownerState={props}>
                    <PaymentIcon />
                  </CustomStepIcon>
                )}
                sx={{
                  '& .MuiStepLabel-label': {
                    color: '#1E293B',
                    fontFamily: '"Urbanist", sans-serif',
                    fontWeight: 600
                  }
                }}
              >
                Payment info
              </StepLabel>
            </Step>
          </Stepper>
        </Box>

        {/* Sign In Form */}
        <Box
          sx={{
            width: '100%',
            maxWidth: '480px',
            px: { xs: 2, sm: 4 },
            py: 4,
            backgroundColor: '#FFFFFF',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 1, 
              fontWeight: 700,
              color: '#232323',
              fontFamily: '"Urbanist", sans-serif'
            }}
          >
            Sign in
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 4, 
              color: '#1E293B',
              fontFamily: '"Urbanist", sans-serif',
              fontWeight: 600
            }}
          >
            Please login to continue to your account.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  mb: 1, 
                  fontWeight: 800,
                  color: '#0F172A',
                  fontSize: '0.9rem',
                  fontFamily: '"Urbanist", sans-serif'
                }}
              >
                Email
              </Typography>
              <TextField
                fullWidth
                type="email"
                placeholder="jonas_kahnwald@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    height: '48px',
                    borderRadius: 8,
                    '& fieldset': {
                      borderColor: '#6818A5',
                      borderWidth: 2
                    },
                    '&:hover fieldset': {
                      borderColor: '#6818A5'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#6818A5',
                      borderWidth: 2
                    }
                  },
                  '& input::placeholder': {
                    color: '#CBD5E1',
                    fontWeight: 350,
                    opacity: 1
                  },
                  '& input': {
                    fontWeight: 600,
                    color: '#0F172A'
                  }
                }}
              />
            </Box>

            <Box>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  mb: 1, 
                  fontWeight: 800,
                  color: '#0F172A',
                  fontSize: '0.9rem',
                  fontFamily: '"Urbanist", sans-serif'
                }}
              >
                Password
              </Typography>
              <TextField
                fullWidth
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    height: '48px',
                    borderRadius: 8,
                    '& fieldset': {
                      borderColor: '#E5E5E5',
                      borderWidth: 2
                    },
                    '&:hover fieldset': {
                      borderColor: '#6818A5'
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#6818A5',
                      borderWidth: 2
                    }
                  },
                  '& input::placeholder': {
                    color: '#CBD5E1',
                    fontWeight: 350,
                    opacity: 1
                  },
                  '& input': {
                    fontWeight: 600,
                    color: '#0F172A'
                  }
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <input 
                type="checkbox" 
                id="keepLoggedIn"
                style={{ 
                  width: '16px', 
                  height: '16px', 
                  marginRight: '8px',
                  accentColor: '#6818A5'
                }}
              />
              <Typography 
                sx={{ 
                  color: '#0F172A',
                  fontFamily: '"Urbanist", sans-serif',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                Keep me logged in
              </Typography>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              onClick={handleSubmit}
              sx={{
                py: 1.5,
                height: '56px',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                fontFamily: '"Urbanist", sans-serif',
                backgroundColor: '#6818A5',
                borderRadius: 8,
                '&:hover': {
                  backgroundColor: '#5a1594'
                }
              }}
            >
              Sign in
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
              <Box sx={{ flex: 1, height: '1px', backgroundColor: '#E5E5E5' }} />
              <Typography sx={{ px: 2, color: '#1E293B', fontFamily: '"Urbanist", sans-serif', fontWeight: 600 }}>or</Typography>
              <Box sx={{ flex: 1, height: '1px', backgroundColor: '#E5E5E5' }} />
            </Box>

            <Button
              variant="outlined"
              fullWidth
              sx={{
                py: 1.5,
                height: '56px',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                fontFamily: '"Urbanist", sans-serif',
                borderColor: '#E5E5E5',
                color: '#232323',
                borderRadius: 8,
                '&:hover': {
                  borderColor: '#6818A5',
                  backgroundColor: '#F7F4FD'
                }
              }}
            >
              Sign in with Google
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Typography sx={{ color: '#1E293B', fontFamily: '"Urbanist", sans-serif', fontSize: '0.9rem', fontWeight: 600 }}>
                Need an account?{' '}
                <Link 
                  component={RouterLink} 
                  to="/signup" 
                  sx={{ 
                    color: '#6818A5',
                    textDecoration: 'underline',
                    fontWeight: 600,
                    fontFamily: '"Urbanist", sans-serif',
                    '&:hover': {
                      color: '#5a1594'
                    }
                  }}
                >
                  Create one
                </Link>
              </Typography>
            </Box>
          </Box>
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default Login; 