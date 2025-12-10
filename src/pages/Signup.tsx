import React, { useState, useEffect, useRef } from 'react';
import { Typography, Box, TextField, Button, Link, Stepper, Step, StepLabel, StepConnector, MenuItem, Select, FormControl, InputAdornment, IconButton } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import PaymentIcon from '@mui/icons-material/Payment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

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

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    state: '',
    country: '',
    mobile_number: '',
    business_type: '',
    company: '',
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [detectedTimezone, setDetectedTimezone] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Refs for all input fields in tab order
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const stateRef = useRef<HTMLInputElement>(null);
  const countryRef = useRef<HTMLInputElement>(null);
  const mobileNumberRef = useRef<HTMLInputElement>(null);
  const businessTypeRef = useRef<HTMLInputElement>(null);
  const companyRef = useRef<HTMLInputElement>(null);

  // Define tab order: left column first, then right column
  // Left: name -> password -> city -> country -> business_type
  // Right: email -> confirmPassword -> state -> mobile_number -> company
  const tabOrder = [
    nameRef,      // Left 1
    emailRef,     // Right 1
    passwordRef,  // Left 2
    confirmPasswordRef, // Right 2
    cityRef,      // Left 3
    stateRef,     // Right 3
    countryRef,   // Left 4
    mobileNumberRef, // Right 4
    businessTypeRef, // Left 5
    companyRef    // Right 5
  ];

  // Handle Tab key navigation
  const handleTabKey = (e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      const nextIndex = currentIndex + 1;
      if (nextIndex < tabOrder.length && tabOrder[nextIndex].current) {
        tabOrder[nextIndex].current?.focus();
      }
    }
  };

  // Handle Enter key to submit form
  const handleEnterKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  // Auto-detect user's timezone on component mount
  useEffect(() => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setDetectedTimezone(timezone);
    } catch (error) {
      console.warn('Could not detect timezone, defaulting to UTC');
      setDetectedTimezone('UTC');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      alert('Name, email, and password are required.');
      return;
    }
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      alert('Please enter a valid email address.');
      return;
    }
    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
      const res = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          city: formData.city || null,
          state: formData.state || null,
          country: formData.country || null,
          mobile_number: formData.mobile_number || null,
          timezone: detectedTimezone || null,
          business_type: formData.business_type || null,
          company: formData.company || null
        })
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || 'Signup failed.');
      } else {
        alert(data.message);
        // Redirect to email verification page
        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      }
    } catch (err) {
      alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              color: '#0F172A',
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
                    color: '#0F172A',
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
                    color: '#0F172A',
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

        {/* Sign Up Form */}
        <Box
          sx={{
            width: '100%',
            maxWidth: '900px',
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
              fontWeight: 800,
              color: '#0F172A',
              fontFamily: '"Urbanist", sans-serif'
            }}
          >
            Sign Up
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

          <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4 }}>
            {/* Left Column */}
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
                  Your Name
                </Typography>
                <TextField
                  inputRef={nameRef}
                  fullWidth
                  placeholder="Jonas Khanwald"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  onKeyDown={(e) => {
                    handleTabKey(e, 0);
                    handleEnterKey(e);
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
                  inputRef={passwordRef}
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onKeyDown={(e) => {
                    handleTabKey(e, 2);
                    handleEnterKey(e);
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ 
                            color: '#64748B',
                            '&:focus': {
                              outline: 'none',
                            },
                            '&:focus-visible': {
                              outline: 'none',
                            },
                            '&:focus-visible::after': {
                              display: 'none',
                            }
                          }}
                          disableFocusRipple
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
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
                  City
                </Typography>
                <TextField
                  inputRef={cityRef}
                  fullWidth
                  placeholder="Enter your City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  onKeyDown={(e) => {
                    handleTabKey(e, 4);
                    handleEnterKey(e);
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
                  Country
                </Typography>
                <TextField
                  inputRef={countryRef}
                  fullWidth
                  placeholder="Enter your Country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  onKeyDown={(e) => {
                    handleTabKey(e, 6);
                    handleEnterKey(e);
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
                  Business Type
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={formData.business_type}
                    onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                    displayEmpty
                    onKeyDown={(e) => {
                      if (e.key === 'Tab' && !e.shiftKey) {
                        e.preventDefault();
                        companyRef.current?.focus();
                      } else if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSubmit(e as any);
                      }
                    }}
                    sx={{ 
                      height: '48px',
                      borderRadius: 8,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#E5E5E5',
                        borderWidth: 2
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6818A5'
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6818A5',
                        borderWidth: 2
                      },
                      '& .MuiSelect-select': {
                        fontWeight: 600,
                        color: formData.business_type ? '#0F172A' : '#CBD5E1',
                        padding: '12px 14px'
                      }
                    }}
                  >
                    <MenuItem value="" disabled>
                      <em style={{ color: '#475569', fontWeight: 500 }}>Choose your business type</em>
                    </MenuItem>
                    <MenuItem value="Hotel">Hotel</MenuItem>
                    <MenuItem value="Travel Agency">Travel Agency</MenuItem>
                    <MenuItem value="Online Travel Agency (OTA)">Online Travel Agency (OTA)</MenuItem>
                    <MenuItem value="Corporate Travel">Corporate Travel</MenuItem>
                    <MenuItem value="Tour Operator">Tour Operator</MenuItem>
                    <MenuItem value="Destination Management Company (DMC)">Destination Management Company (DMC)</MenuItem>
                    <MenuItem value="Revenue Management">Revenue Management</MenuItem>
                    <MenuItem value="Market Research">Market Research</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Right Column */}
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
                  inputRef={emailRef}
                  fullWidth
                  type="email"
                  placeholder="jonas_kahnwald@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onKeyDown={(e) => {
                    handleTabKey(e, 1);
                    handleEnterKey(e);
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
                  Confirm Password
                </Typography>
                <TextField
                  inputRef={confirmPasswordRef}
                  fullWidth
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  onKeyDown={(e) => {
                    handleTabKey(e, 3);
                    handleEnterKey(e);
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          sx={{ 
                            color: '#64748B',
                            '&:focus': {
                              outline: 'none',
                            },
                            '&:focus-visible': {
                              outline: 'none',
                            },
                            '&:focus-visible::after': {
                              display: 'none',
                            }
                          }}
                          disableFocusRipple
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
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
                  State
                </Typography>
                <TextField
                  inputRef={stateRef}
                  fullWidth
                  placeholder="Enter your State"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  onKeyDown={(e) => {
                    handleTabKey(e, 5);
                    handleEnterKey(e);
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
                  Mobile No.
                </Typography>
                <TextField
                  inputRef={mobileNumberRef}
                  fullWidth
                  placeholder="Enter your Mobile No."
                  value={formData.mobile_number}
                  onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                  onKeyDown={(e) => {
                    handleTabKey(e, 7);
                    handleEnterKey(e);
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
                  Business Name
                </Typography>
                <TextField
                  inputRef={companyRef}
                  fullWidth
                  placeholder="Enter your Business Name"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  onKeyDown={(e) => {
                    handleTabKey(e, 9);
                    handleEnterKey(e);
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
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ mt: 4 }}>
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
                mb: 2,
                '&:hover': {
                  backgroundColor: '#5a1594'
                }
              }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign up'}
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
                color: '#0F172A',
                borderRadius: 8,
                mb: 3,
                '&:hover': {
                  borderColor: '#6818A5',
                  backgroundColor: '#F7F4FD'
                }
              }}
            >
              Continue with Google
            </Button>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Typography sx={{ color: '#1E293B', fontFamily: '"Urbanist", sans-serif', fontSize: '0.9rem', fontWeight: 600 }}>
                Already have an account?{' '}
                <Link 
                  component={RouterLink} 
                  to="/auth" 
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
                  Sign in
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

export default Signup; 