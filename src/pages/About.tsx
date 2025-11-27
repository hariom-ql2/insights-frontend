
import { Box, Typography, Container, Grid, Card, CardContent } from '@mui/material';
import { Business, Analytics, Speed, Security, Support, TrendingUp } from '@mui/icons-material';

const About = () => {
  const features = [
    {
      icon: <Analytics sx={{ fontSize: 40, color: '#6818A5' }} />,
      title: 'Advanced Analytics',
      description: 'Comprehensive data analysis and insights to help you make informed decisions about hotel bookings and pricing trends.'
    },
    {
      icon: <Speed sx={{ fontSize: 40, color: '#6818A5' }} />,
      title: 'Real-time Search',
      description: 'Get instant results with our lightning-fast search engine that scans thousands of hotels across multiple platforms.'
    },
    {
      icon: <Security sx={{ fontSize: 40, color: '#6818A5' }} />,
      title: 'Secure Platform',
      description: 'Your data is protected with enterprise-grade security measures and privacy-first approach.'
    },
    {
      icon: <Support sx={{ fontSize: 40, color: '#6818A5' }} />,
      title: '24/7 Support',
      description: 'Our dedicated support team is always ready to help you with any questions or technical issues.'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: '#6818A5' }} />,
      title: 'Price Tracking',
      description: 'Monitor price fluctuations and get alerts when your preferred hotels drop to your target price.'
    },
    {
      icon: <Business sx={{ fontSize: 40, color: '#6818A5' }} />,
      title: 'Business Solutions',
      description: 'Tailored solutions for travel agencies, corporate booking, and hospitality businesses.'
    }
  ];

  const stats = [
    { number: '10M+', label: 'Hotels Analyzed' },
    { number: '50K+', label: 'Happy Customers' },
    { number: '99.9%', label: 'Uptime Guarantee' },
    { number: '24/7', label: 'Customer Support' }
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
              fontWeight: 700,
              color: '#232323',
              mb: 3,
              background: 'linear-gradient(135deg, #6818A5 0%,rgb(126, 110, 47) 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            About InsightInn
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
            Empowering travelers and businesses with intelligent hotel search, 
            comprehensive analytics, and data-driven insights for smarter booking decisions.
          </Typography>
        </Box>

        {/* Mission Section */}
        <Card sx={{ mb: 8, borderRadius: 3, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
          <CardContent sx={{ p: 6 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h3" sx={{ color: '#6818A5', mb: 3, fontWeight: 700 }}>
                  Our Mission
                </Typography>
                <Typography variant="body1" sx={{ color: '#1E293B', lineHeight: 1.8, mb: 3, fontWeight: 600 }}>
                  At InsightInn, we believe that finding the perfect hotel shouldn't be a challenge. 
                  Our mission is to revolutionize the way people discover, compare, and book hotels 
                  by providing comprehensive data analytics, real-time pricing insights, and 
                  personalized recommendations.
                </Typography>
                <Typography variant="body1" sx={{ color: '#1E293B', lineHeight: 1.8, fontWeight: 600 }}>
                  We're committed to transparency, accuracy, and user empowerment, ensuring that 
                  every booking decision is informed by reliable data and intelligent analysis.
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Team Section */}
        <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}>
          <CardContent sx={{ p: 6 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                color: '#6818A5', 
                mb: 6,
                fontWeight: 700
              }}
            >
              Our Team
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#1E293B', 
                mx: 'auto',
                lineHeight: 1.8,
                mb: 4,
                fontWeight: 600
              }}
            >
              We're a diverse team of travel enthusiasts, data scientists, and technology experts 
              who are passionate about making hotel booking smarter and more transparent.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default About; 