import { AppBar, Toolbar, Box, Button, IconButton, Menu, MenuItem, useTheme, useMediaQuery, Typography, TextField } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import PersonIcon from '@mui/icons-material/Person';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useAuth } from '../contexts/AuthContext';

const NavButton = ({ children, ...props }: any) => (
  <Button
    {...props}
    sx={{
      color: '#0F172A',
      fontWeight: 700,
      fontSize: '0.95rem',
      px: 2,
      fontFamily: '"Urbanist", sans-serif',
      '&:hover': { backgroundColor: '#F7F4FD', color: '#6818A5' },
      ...props.sx
    }}
  >
    {children}
  </Button>
);

const SignupButton = ({ children, ...props }: any) => (
  <Button
    variant="contained"
    {...props}
    sx={{
      ml: 2,
      px: 3,
      height: '40px',
      fontSize: '0.95rem',
      fontWeight: 600,
      textTransform: 'none',
      fontFamily: '"Urbanist", sans-serif',
      backgroundColor: '#6818A5',
      '&:hover': { backgroundColor: '#5a1594' },
      ...props.sx
    }}
  >
    {children}
  </Button>
);

const Header = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [captchaOpen, setCaptchaOpen] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaText, setCaptchaText] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [downloadFormat, setDownloadFormat] = useState<'csv' | 'json'>('csv');
  const [downloadMenuAnchor, setDownloadMenuAnchor] = useState<null | HTMLElement>(null);

  const { logout, isAuthenticated, isAdmin } = useAuth();

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let str = '';
    for (let i = 0; i < 6; i++) str += chars[Math.floor(Math.random() * chars.length)];
    return str;
  };

  const handleMobileMenu = (event: React.MouseEvent<HTMLElement>) => { setMobileMenuAnchor(event.currentTarget); };
  const handleUserMenu = (event: React.MouseEvent<HTMLElement>) => { setUserMenuAnchor(event.currentTarget); };
  const handleCloseMobileMenu = () => { setMobileMenuAnchor(null); };
  const handleCloseUserMenu = () => { setUserMenuAnchor(null); };

  const handleLogout = async () => { 
    setUserMenuAnchor(null); 
    await logout(); 
  };


  const handleDownloadMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setDownloadMenuAnchor(event.currentTarget);
  };

  const handleDownloadMenuClose = () => {
    setDownloadMenuAnchor(null);
  };

  const handleDownloadFormatSelect = (format: 'csv' | 'json') => {
    setDownloadFormat(format);
    setDownloadMenuAnchor(null);
    setCaptchaText(generateCaptcha());
    setCaptchaInput('');
    setCaptchaError('');
    setCaptchaOpen(true);
  };
  
  const handleCaptchaSubmit = async () => {
    if (captchaInput.trim().toUpperCase() !== captchaText) { 
      setCaptchaError('Incorrect captcha. Please try again.'); 
      setCaptchaText(generateCaptcha()); 
      setCaptchaInput(''); 
      return; 
    }
    setCaptchaOpen(false); 
    setCaptchaError('');
    try {
      const formatParam = downloadFormat === 'json' ? '?format=json' : '?format=csv';
      const res = await fetch(`http://localhost:5001/download-sample-data${formatParam}`);
      if (!res.ok) throw new Error('Failed to download sample data');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const extension = downloadFormat === 'json' ? 'json' : 'csv';
      a.download = `insightInn_sample_data.${extension}`;
      document.body.appendChild(a); 
      a.click(); 
      a.remove(); 
      window.URL.revokeObjectURL(url);
    } catch (e) { 
      alert('Error downloading sample data.'); 
    }
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ width: '100%', backgroundColor: '#FFFFFF', backdropFilter: 'blur(8px)', borderBottom: '1px solid', borderColor: '#E5E5E5' }}>
      <Box sx={{ width: '100%', maxWidth: '100%', mx: 'auto', px: { xs: 2, sm: 4 } }}>
        <Toolbar sx={{ px: 0 }}>
          <Box component={RouterLink} to="/" sx={{ textDecoration: 'none', color: '#6818A5', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.02em', mr: 4, fontFamily: '"Urbanist", sans-serif' }}>
            InsightsInn
          </Box>

          {isMobile ? (
            <>
              <Box sx={{ flexGrow: 1 }} />
              <IconButton edge="end" color="inherit" aria-label="menu" onClick={handleMobileMenu} sx={{ color: '#0F172A' }}>
                <MenuIcon />
              </IconButton>
              <Menu anchorEl={mobileMenuAnchor} open={Boolean(mobileMenuAnchor)} onClose={handleCloseMobileMenu} PaperProps={{ sx: { mt: 1.5, borderRadius: 2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' } }}>
                <MenuItem onClick={() => { handleCloseMobileMenu(); navigate('/'); }}>Home</MenuItem>
                <MenuItem onClick={() => { handleCloseMobileMenu(); navigate('/about'); }}>About</MenuItem>
                <MenuItem onClick={() => { handleCloseMobileMenu(); navigate('/services'); }}>Services</MenuItem>
                <MenuItem onClick={() => { handleCloseMobileMenu(); navigate('/contact'); }}>Contact</MenuItem>
                <MenuItem onClick={() => { handleCloseMobileMenu(); navigate('/pricing'); }}>Pricing</MenuItem>
                {isAuthenticated && (
                  <MenuItem onClick={() => { handleCloseMobileMenu(); navigate('/reports'); }}>Reports</MenuItem>
                )}
                {isAuthenticated ? (
                  <>
                    <MenuItem onClick={() => { handleCloseMobileMenu(); navigate('/account'); }}>Account</MenuItem>
                    <MenuItem onClick={() => { handleCloseMobileMenu(); navigate('/collections'); }}>My Collections</MenuItem>
                    <MenuItem onClick={() => { handleCloseMobileMenu(); navigate('/searches'); }}>My Searches</MenuItem>
                    <MenuItem onClick={() => { handleCloseMobileMenu(); navigate('/schedules'); }}>My Schedules</MenuItem>
                    <MenuItem onClick={() => { handleCloseMobileMenu(); navigate('/wallet'); }}>My Wallet</MenuItem>
                    {isAdmin && (
                      <MenuItem onClick={() => { handleCloseMobileMenu(); navigate('/admin/dashboard'); }}>Admin Panel</MenuItem>
                    )}
                    <MenuItem onClick={() => { handleCloseMobileMenu(); handleLogout(); }}>Logout</MenuItem>
                  </>
                ) : (
                  <>
                    <MenuItem onClick={() => { handleCloseMobileMenu(); navigate('/auth'); }}>Sign In</MenuItem>
                    <MenuItem onClick={() => { handleCloseMobileMenu(); navigate('/signup'); }}>Sign Up</MenuItem>
                  </>
                )}
              </Menu>
            </>
          ) : (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                <NavButton onClick={() => navigate('/')}>Home</NavButton>
                <NavButton onClick={() => navigate('/about')}>About</NavButton>
                <NavButton onClick={() => navigate('/services')}>Services</NavButton>
                <NavButton onClick={() => navigate('/contact')}>Contact</NavButton>
                <NavButton onClick={() => navigate('/pricing')}>Pricing</NavButton>
                {isAuthenticated && (
                  <NavButton onClick={() => navigate('/reports')}>Reports</NavButton>
                )}
              </Box>
              <Box sx={{ flexGrow: 1 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={handleDownloadMenuOpen} 
                  endIcon={<ArrowDropDownIcon />}
                  sx={{ 
                    borderColor: '#6818A5', 
                    color: '#6818A5', 
                    '&:hover': { borderColor: '#5a1594', backgroundColor: '#F7F4FD' }, 
                    height: '36px', 
                    fontSize: '0.875rem', 
                    fontWeight: 600, 
                    textTransform: 'none', 
                    px: 2, 
                    fontFamily: '"Urbanist", sans-serif' 
                  }}
                >
                  {/* Download Sample Data ({downloadFormat.toUpperCase()}) */}
                  Download Sample Data
                </Button>
                <Menu
                  anchorEl={downloadMenuAnchor}
                  open={Boolean(downloadMenuAnchor)}
                  onClose={handleDownloadMenuClose}
                  PaperProps={{
                    sx: { mt: 1.5, borderRadius: 2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }
                  }}
                >
                  <MenuItem onClick={() => handleDownloadFormatSelect('csv')} selected={downloadFormat === 'csv'}>
                    Download as CSV
                  </MenuItem>
                  <MenuItem onClick={() => handleDownloadFormatSelect('json')} selected={downloadFormat === 'json'}>
                    Download as JSON
                  </MenuItem>
                </Menu>
              </Box>
              {isAuthenticated ? (
                <>
                  <IconButton onClick={handleUserMenu} sx={{ ml: 2 }}>
                    <PersonIcon />
                  </IconButton>
                  <Menu anchorEl={userMenuAnchor} open={Boolean(userMenuAnchor)} onClose={handleCloseUserMenu}>
                    <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/account'); }}>Account</MenuItem>
                    <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/collections'); }}>My Collections</MenuItem>
                    <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/searches'); }}>My Searches</MenuItem>
                    <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/schedules'); }}>My Schedules</MenuItem>
                    <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/wallet'); }}>My Wallet</MenuItem>
                    {isAdmin && (
                      <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/admin/dashboard'); }}>Admin Panel</MenuItem>
                    )}
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <IconButton onClick={handleUserMenu} sx={{ ml: 2 }}>
                    <PersonIcon />
                  </IconButton>
                  <Menu anchorEl={userMenuAnchor} open={Boolean(userMenuAnchor)} onClose={handleCloseUserMenu}>
                    <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/account'); }}>Account</MenuItem>
                    <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/collections'); }}>My Collections</MenuItem>
                    <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/searches'); }}>My Searches</MenuItem>
                    <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/schedules'); }}>My Schedules</MenuItem>
                    <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/wallet'); }}>My Wallet</MenuItem>
                    <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/auth'); }}>Sign In</MenuItem>
                  </Menu>
                  <SignupButton onClick={() => navigate('/auth')}>Sign In</SignupButton>
                </>
              )}
            </>
          )}
        </Toolbar>
      </Box>
      {/* Captcha Dialog unchanged */}
      <Dialog open={captchaOpen} onClose={() => setCaptchaOpen(false)}>
        <DialogTitle>Text Captcha</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>Please enter the following text to continue:</Typography>
          <Box sx={{ fontWeight: 700, fontSize: '1.5rem', letterSpacing: '0.2em', background: '#F1F5F9', p: 2, mb: 2, textAlign: 'center', borderRadius: 1, userSelect: 'none' }}>{captchaText}</Box>
          <TextField autoFocus fullWidth label="Enter captcha text" value={captchaInput} onChange={e => setCaptchaInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleCaptchaSubmit(); }} error={!!captchaError} helperText={captchaError} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCaptchaOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCaptchaSubmit}>Submit</Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );
};

export default Header; 