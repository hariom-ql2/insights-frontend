import React, { useState } from 'react';
import { Typography, Box, TextField, Button, Alert, Container, Card, CardContent, FormControl, Select, MenuItem } from '@mui/material';
import { Send, Phone, Email, Business } from '@mui/icons-material';
import type { SelectChangeEvent } from '@mui/material';

const Contact = () => {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    phone: '',
    company: '',
    subject: '',
    query_type: 'general',
    message: '' 
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Validation
    if (!form.name || !form.email || !form.message) {
      setError('Name, email, and message are required.');
      return;
    }
    
    if (!form.email.includes('@') || !form.email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }
    
    setLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
      const res = await fetch(`${API_BASE_URL}/contact-query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Thank you for reaching out! We\'ll get back to you soon.');
        setSubmitted(true);
        setForm({ name: '', email: '', phone: '', company: '', subject: '', query_type: 'general', message: '' });
      } else {
        setError(data.message || 'Failed to submit your query.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <Email sx={{ fontSize: 40, color: '#6818A5' }} />,
      title: 'Email Us',
      description: 'Send us an email anytime',
      value: 'support@insightinn.com'
    },
    {
      icon: <Phone sx={{ fontSize: 40, color: '#6818A5' }} />,
      title: 'Call Us',
      description: 'Mon to Fri 9am to 6pm',
      value: '+1 (555) 123-4567'
    },
    {
      icon: <Business sx={{ fontSize: 40, color: '#6818A5' }} />,
      title: 'Office',
      description: 'Come say hello at our office',
      value: '123 Business St, City, State 12345'
    }
  ];

  return (
    <Box sx={{ backgroundColor: '#F6F9FF', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h1" 
            sx={{ 
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 800,
              color: '#0F172A',
              mb: 3,
              background: 'linear-gradient(135deg, #6818A5 0%,rgb(126, 110, 47) 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Contact Us
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#1E293B',
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.6,
              mb: 4,
              fontWeight: 700
            }}
          >
            Have a question or need assistance? We're here to help! 
            Reach out to us and we'll get back to you as soon as possible.
          </Typography>
        </Box>

        {/* Contact Information Cards */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mb: 8 }}>
          {contactInfo.map((info, index) => (
            <Box key={index} sx={{ flex: 1 }}>
              <Card sx={{ height: '100%', borderRadius: 3, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    {info.icon}
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: '#0F172A', 
                      mb: 1, 
                      fontWeight: 700 
                    }}
                  >
                    {info.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#1E293B', 
                      mb: 1.5,
                      fontWeight: 600
                    }}
                  >
                    {info.description}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#6818A5', 
                      fontWeight: 700 
                    }}
                  >
                    {info.value}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        {/* Contact Form */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
          <CardContent sx={{ p: 6 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                color: '#6818A5', 
                mb: 4,
                fontWeight: 700,
                textAlign: 'center'
              }}
            >
              Send Us a Message
            </Typography>

            {success && (
              <Alert severity="success" sx={{ mb: 4 }}>
                {success}
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 4 }}>
                {error}
              </Alert>
            )}

            {submitted ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    color: '#6818A5', 
                    mb: 2,
                    fontWeight: 700
                  }}
                >
                  Thank You!
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#1E293B', 
                    mb: 4,
                    fontWeight: 600
                  }}
                >
                  We've received your message and will get back to you soon.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => setSubmitted(false)}
                  sx={{
                    borderColor: '#6818A5',
                    color: '#6818A5',
                    fontWeight: 700,
                    '&:hover': {
                      borderColor: '#5a1594',
                      backgroundColor: '#F7F4FD'
                    }
                  }}
                >
                  Send Another Message
                </Button>
              </Box>
            ) : (
              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Name and Email Row */}
                  <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                    {/* Name */}
                    <Box sx={{ flex: 1 }}>
                      <Box>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          mb: 1.5, 
                          fontWeight: 700, 
                          color: '#0F172A', 
                          fontSize: '1rem',
                          fontFamily: '"Urbanist", sans-serif'
                        }}
                      >
                        Full Name <span style={{ color: '#6818A5' }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Enter your full name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            height: '48px',
                            borderRadius: 2,
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
                          '& input': { 
                            fontWeight: 600, 
                            color: '#0F172A',
                            fontFamily: '"Urbanist", sans-serif'
                          },
                          '& input::placeholder': { 
                            color: '#CBD5E1', 
                            fontWeight: 350,
                            opacity: 1
                          }
                        }}
                        required
                      />
                    </Box>
                  </Box>

                  {/* Email */}
                  <Box sx={{ flex: 1 }}>
                    <Box>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          mb: 1.5, 
                          fontWeight: 700, 
                          color: '#0F172A', 
                          fontSize: '1rem',
                          fontFamily: '"Urbanist", sans-serif'
                        }}
                      >
                        Email <span style={{ color: '#6818A5' }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        type="email"
                        placeholder="Enter your email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            height: '48px',
                            borderRadius: 2,
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
                          '& input': { 
                            fontWeight: 600, 
                            color: '#0F172A',
                            fontFamily: '"Urbanist", sans-serif'
                          },
                          '& input::placeholder': { 
                            color: '#CBD5E1', 
                            fontWeight: 350,
                            opacity: 1
                          }
                        }}
                        required
                      />
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' }, mt: 3 }}>
                  {/* Phone */}
                  <Box sx={{ flex: 1 }}>
                    <Box>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          mb: 1.5, 
                          fontWeight: 700, 
                          color: '#0F172A', 
                          fontSize: '1rem',
                          fontFamily: '"Urbanist", sans-serif'
                        }}
                      >
                        Phone Number
                      </Typography>
                      <TextField
                        fullWidth
                        type="tel"
                        placeholder="Enter your phone number"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            height: '48px',
                            borderRadius: 2,
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
                          '& input': { 
                            fontWeight: 600, 
                            color: '#0F172A',
                            fontFamily: '"Urbanist", sans-serif'
                          },
                          '& input::placeholder': { 
                            color: '#CBD5E1', 
                            fontWeight: 350,
                            opacity: 1
                          }
                        }}
                      />
                      </Box>
                    </Box>

                    {/* Company */}
                    <Box sx={{ flex: 1 }}>
                      <Box>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          mb: 1.5, 
                          fontWeight: 700, 
                          color: '#0F172A', 
                          fontSize: '1rem',
                          fontFamily: '"Urbanist", sans-serif'
                        }}
                      >
                        Company
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Enter your company name"
                        name="company"
                        value={form.company}
                        onChange={handleChange}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            height: '48px',
                            borderRadius: 2,
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
                          '& input': { 
                            fontWeight: 600, 
                            color: '#0F172A',
                            fontFamily: '"Urbanist", sans-serif'
                          },
                          '& input::placeholder': { 
                            color: '#CBD5E1', 
                            fontWeight: 350,
                            opacity: 1
                          }
                        }}
                      />
                      </Box>
                    </Box>
                  </Box>

                  {/* Query Type and Subject Row */}
                  <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                    {/* Query Type */}
                    <Box sx={{ flex: 1 }}>
                      <Box>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          mb: 1.5, 
                          fontWeight: 700, 
                          color: '#0F172A', 
                          fontSize: '1rem',
                          fontFamily: '"Urbanist", sans-serif'
                        }}
                      >
                        Query Type
                      </Typography>
                      <FormControl fullWidth>
                        <Select
                          name="query_type"
                          value={form.query_type}
                          onChange={handleSelectChange}
                          sx={{ 
                            height: '48px',
                            borderRadius: 2,
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
                            },
                            '& .MuiSelect-select': {
                              fontWeight: 600,
                              color: '#0F172A',
                              fontFamily: '"Urbanist", sans-serif'
                            }
                          }}
                        >
                          <MenuItem value="general">General Inquiry</MenuItem>
                          <MenuItem value="support">Support</MenuItem>
                          <MenuItem value="sales">Sales</MenuItem>
                          <MenuItem value="technical">Technical</MenuItem>
                          <MenuItem value="feedback">Feedback</MenuItem>
                        </Select>
                      </FormControl>
                      </Box>
                    </Box>

                    {/* Subject */}
                    <Box sx={{ flex: 1 }}>
                      <Box>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          mb: 1.5, 
                          fontWeight: 700, 
                          color: '#0F172A', 
                          fontSize: '1rem',
                          fontFamily: '"Urbanist", sans-serif'
                        }}
                      >
                        Subject
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Enter subject"
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            height: '48px',
                            borderRadius: 2,
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
                          '& input': { 
                            fontWeight: 600, 
                            color: '#0F172A',
                            fontFamily: '"Urbanist", sans-serif'
                          },
                          '& input::placeholder': { 
                            color: '#CBD5E1', 
                            fontWeight: 350,
                            opacity: 1
                          }
                        }}
                      />
                      </Box>
                    </Box>
                  </Box>

                  {/* Message */}
                  <Box sx={{ mt: 3 }}>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          mb: 1.5, 
                          fontWeight: 700, 
                          color: '#0F172A', 
                          fontSize: '1rem',
                          fontFamily: '"Urbanist", sans-serif'
                        }}
                      >
                        Message <span style={{ color: '#6818A5' }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        minRows={6}
                        placeholder="Type your message here..."
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            borderRadius: 2,
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
                          '& textarea': { 
                            fontWeight: 600, 
                            color: '#0F172A',
                            fontFamily: '"Urbanist", sans-serif'
                          },
                          '& textarea::placeholder': { 
                            color: '#CBD5E1', 
                            fontWeight: 350,
                            opacity: 1
                          }
                        }}
                        required
                      />
                      </Box>
                  </Box>

                  {/* Submit Button */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<Send sx={{ color: 'white' }} />}
                        disabled={loading}
                        sx={{
                          px: 6,
                          py: 1.5,
                          height: '56px',
                          fontSize: '1rem',
                          fontWeight: 700,
                          textTransform: 'none',
                          fontFamily: '"Urbanist", sans-serif',
                          backgroundColor: '#6818A5',
                          borderRadius: 2,
                          '&:hover': {
                            backgroundColor: '#5a1594'
                          }
                        }}
                      >
                        {loading ? 'Sending...' : 'Send Message'}
                      </Button>
                </Box>
              </form>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Contact;
