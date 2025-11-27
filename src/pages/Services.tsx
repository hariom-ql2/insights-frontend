
import { Box, Typography, Container, Grid, Card, CardContent, Chip, Button } from '@mui/material';
import { 
  Search, 
  Analytics, 
  Download, 
  Business, 
  Api, 
  Schedule,
  TrendingUp,
  Security,
  Speed,
  Support,
  CheckCircle,
  Star
} from '@mui/icons-material';

const Services = () => {
  const coreServices = [
    {
      icon: <Search sx={{ fontSize: 40, color: '#6818A5' }} />,
      title: 'Hotel Search & Comparison',
      description: 'Comprehensive search across thousands of hotels with advanced filtering options, real-time availability, and detailed comparisons.',
      features: ['Multi-platform search', 'Advanced filters', 'Real-time availability', 'Detailed comparisons']
    },
    {
      icon: <Analytics sx={{ fontSize: 40, color: '#6818A5' }} />,
      title: 'Price Analytics & Trends',
      description: 'Deep insights into pricing patterns, seasonal trends, and market analysis to help you find the best deals.',
      features: ['Historical price data', 'Trend analysis', 'Price alerts', 'Market insights']
    },
    {
      icon: <Download sx={{ fontSize: 40, color: '#6818A5' }} />,
      title: 'Custom Data Exports',
      description: 'Export hotel data, pricing information, and analytics in various formats for further analysis and reporting.',
      features: ['Multiple formats', 'Custom filters', 'Scheduled exports', 'API integration']
    },
    {
      icon: <Business sx={{ fontSize: 40, color: '#6818A5' }} />,
      title: 'Business Solutions',
      description: 'Tailored solutions for travel agencies, corporate booking, and hospitality businesses with dedicated support.',
      features: ['Corporate accounts', 'Bulk booking', 'Custom reporting', 'Dedicated support']
    },
    {
      icon: <Api sx={{ fontSize: 40, color: '#6818A5' }} />,
      title: 'API Access & Integrations',
      description: 'Robust API access for seamless integration with your existing systems and applications.',
      features: ['RESTful API', 'Real-time data', 'Webhook support', 'SDK libraries']
    },
    {
      icon: <Schedule sx={{ fontSize: 40, color: '#6818A5' }} />,
      title: 'Automated Scheduling',
      description: 'Set up automated searches and monitoring schedules to stay updated on price changes and availability.',
      features: ['Custom schedules', 'Email notifications', 'Price monitoring', 'Availability alerts']
    }
  ];

  const additionalFeatures = [
    { icon: <Security />, text: 'Enterprise-grade security' },
    { icon: <Speed />, text: 'Lightning-fast performance' },
    { icon: <Support />, text: '24/7 customer support' },
    { icon: <TrendingUp />, text: 'Continuous platform updates' },
    { icon: <CheckCircle />, text: '99.9% uptime guarantee' },
    { icon: <Star />, text: 'Premium data quality' }
  ];

  const pricingTiers = [
    {
      name: 'Basic',
      price: '$299/mo',
      description: 'Perfect for individual travelers and small teams',
      features: ['Hotel Search & Comparison', 'Basic Analytics', 'Standard Support', 'CSV Exports']
    },
    {
      name: 'Pro',
      price: '$399/mo',
      description: 'Ideal for growing businesses and travel agencies',
      features: ['Everything in Basic', 'Advanced Analytics', 'Priority Support', 'API Access', 'Custom Reports']
    },
    {
      name: 'Enterprise',
      price: '$499/mo',
      description: 'Complete solution for large organizations',
      features: ['Everything in Pro', 'White-label Solutions', 'Dedicated Support', 'Custom Integrations', 'SLA Guarantee']
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
              background: 'linear-gradient(135deg, #6818A5 0%,rgb(131, 117, 59) 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Our Services
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
            Comprehensive hotel search and analytics solutions designed to meet 
            the needs of travelers, businesses, and developers worldwide.
          </Typography>
        </Box>

        {/* Core Services Grid */}
        <Box sx={{ mb: 8 }}>
          <Typography 
            variant="h2" 
            sx={{ 
              textAlign: 'center', 
              color: '#0F172A', 
              mb: 6,
              fontWeight: 800
            }}
          >
            Core Services
          </Typography>

          {/* TODO: make them centre, justified and same width of the boxes*/}
          <Grid container spacing={4} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', margin: '0 auto', width: '80%' }}>
            {coreServices.map((service, index) => (
              <Grid item xs={12} md={6} key={index} sx={{ width: '100%' }}>
                <Card sx={{ width: '100%', height: '100%' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ mb: 3 }}>
                      {service.icon}
                    </Box>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        color: '#0F172A', 
                        mb: 2, 
                        fontWeight: 700 
                      }}
                    >
                      {service.title}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: '#1E293B', 
                        lineHeight: 1.6,
                        mb: 3,
                        fontWeight: 600
                      }}
                    >
                      {service.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {service.features.map((feature, idx) => (
                        <Chip
                          key={idx}
                          label={feature}
                          size="small"
                          sx={{
                            backgroundColor: '#F7F4FD',
                            color: '#6818A5',
                            fontWeight: 700,
                            fontSize: '0.75rem'
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Section */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              sx={{ 
                color: '#0F172A', 
                mb: 4,
                fontWeight: 800
              }}
            >
              Ready to Get Started?
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#1E293B', 
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.8,
                mb: 4,
                fontWeight: 600
              }}
            >
              Join thousands of satisfied customers who trust InsightInn for their 
              hotel search and analytics needs. Start your free trial today!
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: '1.1rem'
                }}
              >
                Contact Sales
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Services; 