import React, { useState, useEffect } from 'react';
import { Typography, Box, TextField, Button, Link, Alert } from '@mui/material';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const EmailVerification: React.FC = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuth();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter a valid 6-digit verification code.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
      const res = await fetch(`${API_BASE_URL}/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          code: verificationCode
        })
      });

      const data = await res.json();
      
      if (data.success) {
        // If token and user are returned, automatically log the user in
        if (data.token && data.user) {
          // Set auth state using the context
          setAuth(data.token, {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            is_verified: true,
            role: data.user.role || 'user',
            timezone: data.user.timezone,
            created_at: data.user.created_at || new Date().toISOString(),
          });
          
          setMessage({ type: 'success', text: data.message || 'Email verified successfully! Logging you in...' });
          
          // Redirect based on user role
          setTimeout(() => {
            if (data.user.role === 'admin' || data.user.role === 'super_admin') {
              navigate('/admin/dashboard');
            } else {
              navigate('/');
            }
          }, 1500);
        } else {
          // Fallback: just show success message and redirect to login
          setMessage({ type: 'success', text: data.message || 'Email verified successfully! Please login.' });
          setTimeout(() => {
            navigate('/auth');
          }, 2000);
        }
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Email is required to resend verification code.' });
      return;
    }

    setResendLoading(true);
    setMessage(null);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
      const res = await fetch(`${API_BASE_URL}/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      });

      const data = await res.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '480px',
          mx: 'auto',
          px: { xs: 2, sm: 4 },
          py: 4,
          backgroundColor: 'white',
          borderRadius: 2,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}
      >
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 2, 
            fontWeight: 700,
            color: 'primary.main',
            textAlign: 'center'
          }}
        >
          Verify Your Email
        </Typography>

        <Typography 
          variant="body1" 
          sx={{ 
            mb: 4, 
            textAlign: 'center',
            color: 'text.secondary'
          }}
        >
          We've sent a 6-digit verification code to <strong>{email}</strong>
        </Typography>

        {message && (
          <Alert 
            severity={message.type} 
            sx={{ mb: 3 }}
            onClose={() => setMessage(null)}
          >
            {message.text}
          </Alert>
        )}

        <Box component="form" onSubmit={handleVerification} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                mb: 1.5, 
                fontWeight: 600,
                color: 'text.primary',
                fontSize: '1rem',
              }}
            >
              Verification Code
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setVerificationCode(value);
              }}
              inputProps={{
                maxLength: 6,
                style: { textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.5rem' }
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  height: '48px',
                  margin: '0 !important'
                }
              }}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              py: 1.25,
              height: '48px',
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'none',
            }}
            disabled={loading || verificationCode.length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Didn't receive the code?
            </Typography>
            <Button
              variant="text"
              onClick={handleResendCode}
              disabled={resendLoading}
              sx={{
                color: 'secondary.main',
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              {resendLoading ? 'Sending...' : 'Resend Code'}
            </Button>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Already verified?{' '}
              <Link 
                component={RouterLink} 
                to="/auth" 
                sx={{ 
                  color: 'secondary.main',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    textDecoration: 'underline',
                  }
                }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default EmailVerification;
