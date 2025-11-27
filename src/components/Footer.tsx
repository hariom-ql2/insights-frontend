import { Box, Typography, Link, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        // backgroundColor: 'white',
        backgroundColor: 'grey.100',
        borderTop: '1px solid',
        borderColor: 'grey.100',
        py: 6,
        mt: 'auto'
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '100%',
          mx: 'auto',
          px: { xs: 2, sm: 4 }
        }}
      >
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                mb: 2
              }}
            >
              InsightInn
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Empowering businesses with real-time data insights and analytics for better decision making.
            </Typography>
          </Grid>
          
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                mb: 2
              }}
            >
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link
                component={RouterLink}
                to="/"
                sx={{
                  color: 'text.secondary',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'secondary.main',
                  }
                }}
              >
                Home
              </Link>
              <Link
                component={RouterLink}
                to="/about"
                sx={{
                  color: 'text.secondary',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'secondary.main',
                  }
                }}
              >
                About
              </Link>
              <Link
                component={RouterLink}
                to="/services"
                sx={{
                  color: 'text.secondary',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'secondary.main',
                  }
                }}
              >
                Services
              </Link>
              <Link
                component={RouterLink}
                to="/contact"
                sx={{
                  color: 'text.secondary',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'secondary.main',
                  }
                }}
              >
                Contact
              </Link>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                mb: 2
              }}
            >
              Contact Us
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Email: info@insightinn.com
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Phone: +91 XXX-XXX-XXXX
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Address: Plot 6, Tenon Lane, Udyog Vihar, Sector 18, Gurugram, Haryana, India
            </Typography>
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: 4,
            pt: 3,
            borderTop: '1px solid',
            borderColor: 'grey.100',
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} InsightInn. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer; 