import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Chip,
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  CircularProgress
} from '@mui/material';
import { 
  CheckCircle,
  Star,
  TrendingUp,
  Security,
  Support
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: 'Basic',
    price: 299,
    priceDisplay: '$299/mo',
    description: 'Perfect for individual travelers and small teams',
    popular: false,
    features: [
      'Hotel Search & Comparison',
      'Price Analytics & Trends',
      'Basic Data Export (CSV)',
      'Standard Support',
      'Up to 100 searches/month',
      'Email notifications'
    ],
    limitations: [
      'Limited API access',
      'Basic analytics only',
      'Standard support response'
    ]
  },
  {
    name: 'Pro',
    price: 399,
    priceDisplay: '$399/mo',
    description: 'Ideal for growing businesses and travel agencies',
    popular: true,
    features: [
      'Everything in Basic',
      'Advanced Analytics & Insights',
      'Priority Support',
      'API Access (1,000 calls/month)',
      'Custom Data Exports',
      'Price Alerts & Monitoring',
      'Up to 1,000 searches/month',
      'Scheduled Reports',
      'Webhook Integration'
    ],
    limitations: [
      'Limited custom integrations',
      'Standard SLA'
    ]
  },
  {
    name: 'Enterprise',
    price: 499,
    priceDisplay: '$499/mo',
    description: 'Complete solution for large organizations',
    popular: false,
    features: [
      'Everything in Pro',
      'Unlimited API Access',
      'White-label Solutions',
      'Dedicated Account Manager',
      'Custom Integrations',
      'SLA Guarantee (99.9%)',
      'Unlimited searches',
      'Advanced Security Features',
      'Custom Analytics Dashboard',
      'Priority Feature Requests'
    ],
    limitations: []
  },
];

const Pricing = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogStatus, setDialogStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [dialogMsg, setDialogMsg] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const navigate = useNavigate();

  const handleChoose = async (plan: typeof plans[0]) => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user || !user.email) {
      navigate('/auth');
      return;
    }
    setSelectedPlan(plan);
    setDialogOpen(true);
    setDialogStatus('loading');
    setDialogMsg('Creating payment order...');
    setPaymentUrl('');
    try {
      const res = await fetch('/create-payment-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.name, price: plan.price, user_email: user.email })
      });
      const data = await res.json();
      if (data.success && data.paymentUrl) {
        setDialogStatus('success');
        setDialogMsg('Order created! Redirecting to payment gateway...');
        setPaymentUrl(data.paymentUrl);
        setTimeout(() => {
          window.location.href = data.paymentUrl;
        }, 1500);
      } else {
        setDialogStatus('error');
        setDialogMsg(data.message || 'Failed to create payment order.');
      }
    } catch (err) {
      setDialogStatus('error');
      setDialogMsg('An error occurred. Please try again.');
    }
  };

  const benefits = [
    { icon: <Security sx={{ fontSize: 24, color: '#6818A5' }} />, text: 'Enterprise-grade security' },
    { icon: <TrendingUp sx={{ fontSize: 24, color: '#6818A5' }} />, text: 'Real-time price tracking' },
    { icon: <Support sx={{ fontSize: 24, color: '#6818A5' }} />, text: '24/7 customer support' },
    { icon: <Star sx={{ fontSize: 24, color: '#6818A5' }} />, text: 'Premium data quality' }
  ];

  return (
    <Box sx={{ backgroundColor: '#F6F9FF', minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h1" 
            sx={{ 
              fontWeight: 800,
              // color: '#6818A5',
              // mb: 2,
              // fontFamily: '"Urbanist", sans-serif'
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              // fontWeight: 700,
              color: '#232323',
              mb: 3,
              background: 'linear-gradient(135deg, #6818A5 0%,rgb(126, 110, 47) 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Pricing & Plans
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#1E293B',
              maxWidth: '600px',
              mx: 'auto',
              fontWeight: 600
            }}
          >
            Choose the perfect plan for your needs
          </Typography>
        </Box>

        {/* Benefits Section - Simplified */}
        <Box sx={{ mb: 6, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 3 }}>
          {benefits.map((benefit, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {benefit.icon}
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                {benefit.text}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Pricing Cards */}
        <Box sx={{ mb: 6 }}>
          <Grid container spacing={3} justifyContent="center">
            {plans.map((plan) => (
              <Grid item xs={12} sm={6} md={4} key={plan.name}>
                <Card sx={{ 
                  height: '100%', 
                  borderRadius: 3,
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(104, 24, 165, 0.15)'
                  },
                  ...(plan.popular && {
                    border: '2px solid #6818A5',
                    transform: 'scale(1.05)',
                    '&:hover': {
                      transform: 'scale(1.05) translateY(-8px)'
                    }
                  })
                }}>
                  {plan.popular && (
                    <Chip
                      label="Most Popular"
                      sx={{
                        position: 'absolute',
                        top: -12,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#FACC15',
                        color: '#0F172A',
                        fontWeight: 800,
                        zIndex: 1
                      }}
                    />
                  )}
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          color: '#0F172A', 
                          mb: 1,
                          fontWeight: 800,
                          fontFamily: '"Urbanist", sans-serif'
                        }}
                      >
                        {plan.name}
                      </Typography>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          color: '#6818A5', 
                          mb: 1, 
                          fontWeight: 800,
                          fontFamily: '"Urbanist", sans-serif'
                        }}
                      >
                        {plan.priceDisplay}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#64748B', 
                          mb: 3,
                          fontWeight: 600
                        }}
                      >
                        {plan.description}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      {plan.features.slice(0, 6).map((feature, idx) => (
                        <Box key={idx} sx={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          gap: 1, 
                          mb: 1.5
                        }}>
                          <CheckCircle sx={{ 
                            fontSize: 18, 
                            color: '#6818A5', 
                            mt: 0.2,
                            flexShrink: 0
                          }} />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: '#1E293B',
                              fontWeight: 600,
                              fontSize: '0.875rem'
                            }}
                          >
                            {feature}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    <Button
                      variant={plan.popular ? "contained" : "outlined"}
                      fullWidth
                      onClick={() => handleChoose(plan)}
                      disabled={dialogStatus === 'loading'}
                      sx={{
                        py: 1.5,
                        fontWeight: 600,
                        borderRadius: 2,
                        borderColor: plan.popular ? undefined : '#6818A5',
                        color: plan.popular ? '#FFFFFF' : '#6818A5',
                        backgroundColor: plan.popular ? '#6818A5' : 'transparent',
                        '&:hover': {
                          backgroundColor: plan.popular ? '#5a1594' : '#F7F4FD',
                          borderColor: '#6818A5'
                        },
                        fontFamily: '"Urbanist", sans-serif'
                      }}
                    >
                      {dialogStatus === 'loading' && selectedPlan?.name === plan.name ? 'Processing...' : 'Choose Plan'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* FAQ Section - Reduced to 4 questions */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h5" 
            sx={{ 
              textAlign: 'center', 
              color: '#6818A5', 
              mb: 4,
              fontWeight: 800,
              fontFamily: '"Urbanist", sans-serif'
            }}
          >
            Frequently Asked Questions
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#6818A5', 
                    mb: 1, 
                    fontWeight: 700,
                    fontFamily: '"Urbanist", sans-serif'
                  }}
                >
                  Can I change my plan later?
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#64748B', 
                    fontWeight: 600
                  }}
                >
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#6818A5', 
                    mb: 1, 
                    fontWeight: 700,
                    fontFamily: '"Urbanist", sans-serif'
                  }}
                >
                  Is there a free trial?
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#64748B', 
                    fontWeight: 600
                  }}
                >
                  We offer a 14-day free trial for all plans. No credit card required.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#6818A5', 
                    mb: 1, 
                    fontWeight: 700,
                    fontFamily: '"Urbanist", sans-serif'
                  }}
                >
                  What payment methods do you accept?
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#64748B', 
                    fontWeight: 600
                  }}
                >
                  We accept all major credit cards and PayPal.
                </Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#6818A5', 
                    mb: 1, 
                    fontWeight: 700,
                    fontFamily: '"Urbanist", sans-serif'
                  }}
                >
                  Can I cancel anytime?
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#64748B', 
                    fontWeight: 600
                  }}
                >
                  Yes, you can cancel your subscription at any time. Your access continues until the end of the billing period.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Payment Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ textAlign: 'center', color: '#6818A5', fontWeight: 600 }}>
            Payment Order
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          {dialogStatus === 'loading' && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <CircularProgress size={24} sx={{ color: '#6818A5' }} />
                <Typography variant="body1" sx={{ color: '#1E293B', fontWeight: 600 }}>
                  {dialogMsg}
                </Typography>
              </Box>
          )}
          {dialogStatus === 'success' && (
              <Box>
                <CheckCircle sx={{ fontSize: 48, color: '#6818A5', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#6818A5', mb: 2 }}>
                  {dialogMsg}
                </Typography>
                {selectedPlan && (
                  <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                    Selected Plan: {selectedPlan.name} - {selectedPlan.priceDisplay}
                  </Typography>
                )}
              </Box>
          )}
          {dialogStatus === 'error' && (
              <Box>
                <Typography variant="h6" sx={{ color: '#EA4335', mb: 2 }}>
                  Payment Error
                </Typography>
                <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                  {dialogMsg}
                </Typography>
              </Box>
          )}
        </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button 
              onClick={() => setDialogOpen(false)} 
              disabled={dialogStatus === 'loading'}
              variant="outlined"
              sx={{ mr: 2 }}
            >
              Close
            </Button>
            {paymentUrl && (
              <Button 
                variant="contained" 
                onClick={() => window.location.href = paymentUrl}
                sx={{ backgroundColor: '#6818A5' }}
              >
                Go to Payment
              </Button>
            )}
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
  );
};

export default Pricing; 