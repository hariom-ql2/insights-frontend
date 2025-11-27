import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  Typography,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Search as SearchIcon,
  Folder as CollectionsIcon,
  Schedule as ScheduleIcon,
  History as HistoryIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidthExpanded = 280;
const drawerWidthCollapsed = 72;

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isProfileHovered, setIsProfileHovered] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Results', icon: <SearchIcon />, path: '/admin/searches' },
    { text: 'Collections', icon: <CollectionsIcon />, path: '/admin/collections' },
    { text: 'Schedules', icon: <ScheduleIcon />, path: '/admin/schedules' },
    { text: 'Activity Log', icon: <HistoryIcon />, path: '/admin/activities' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMouseEnter = () => {
    setIsProfileHovered(true);
  };

  const handleProfileMouseLeave = () => {
    setIsProfileHovered(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsProfileHovered(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Get user initials
  const getUserInitials = () => {
    if (user?.name) {
      const names = user.name.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return user.name.charAt(0).toUpperCase();
    }
    return 'A';
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF', position: 'relative' }}>
      {/* Logo Section */}
      <Box sx={{ 
        p: sidebarOpen ? 3 : 2,
        borderBottom: '1px solid #E5E5E5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: sidebarOpen ? 'flex-start' : 'center',
        minHeight: 64,
        position: 'relative',
      }}>
        {sidebarOpen ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Avatar sx={{ 
              bgcolor: '#6818A5', 
              width: 40, 
              height: 40,
              fontWeight: 700
            }}>
              <AdminIcon sx={{ fontSize: 24 }} />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 800, 
                color: '#6818A5',

                fontFamily: '"Urbanist", sans-serif',
                fontSize: '1.25rem',
              }}>
                Admin Panel
              </Typography>
              <Typography variant="caption" sx={{ 
                color: '#1E293B',
                fontFamily: '"Urbanist", sans-serif',
                fontWeight: 600,
                fontSize: '0.7rem',
              }}>
                {/* Management */}
              </Typography>
            </Box>
            {/* Toggle Button - Only visible when sidebar is open */}
            <IconButton
              onClick={() => setSidebarOpen(!sidebarOpen)}
              sx={{
                backgroundColor: '#F7F4FD',
                color: '#6818A5',
                width: 32,
                height: 32,
                '&:hover': {
                  backgroundColor: '#E8D5F5',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
          </Box>
        ) : (
          <>
            {/* Toggle Button - Only visible when sidebar is collapsed */}
            <IconButton
              onClick={() => setSidebarOpen(!sidebarOpen)}
              sx={{
                backgroundColor: '#F7F4FD',
                color: '#6818A5',
                width: 32,
                height: 32,
                '&:hover': {
                  backgroundColor: '#E8D5F5',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </>
        )}
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, py: 2 }}>
        <List sx={{ px: sidebarOpen ? 2 : 1 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  title={!sidebarOpen ? item.text : ''}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: isActive ? '#F7F4FD' : 'transparent',
                    border: isActive ? '1px solid #6818A5' : '1px solid transparent',
                    '&:hover': {
                      backgroundColor: '#F7F4FD',
                      border: '1px solid #6818A5',
                    },
                    transition: 'all 0.3s ease',
                    py: 1.5,
                    px: sidebarOpen ? 2 : 1,
                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: sidebarOpen ? 40 : 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isActive ? '#6818A5' : '#1E293B'
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  {sidebarOpen && (
                    <ListItemText 
                      primary={item.text}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontWeight: isActive ? 800 : 700,
                          color: isActive ? '#6818A5' : '#0F172A',
                          fontFamily: '"Urbanist", sans-serif',
                          fontSize: '0.95rem',
                          transition: 'opacity 0.3s ease',
                          opacity: sidebarOpen ? 1 : 0,
                        }
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* User Profile Section */}
      <Box sx={{ 
        p: sidebarOpen ? 2 : 1, 
        borderTop: '1px solid #E5E5E5',
        position: 'relative',
      }}
      onMouseEnter={sidebarOpen ? handleProfileMouseEnter : undefined}
      onMouseLeave={sidebarOpen ? handleProfileMouseLeave : undefined}
      >
        {/* Expandable Menu - Appears above on hover */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#FFFFFF',
            overflow: 'hidden',
            maxHeight: isProfileHovered ? '200px' : '0',
            opacity: isProfileHovered ? 1 : 0,
            transform: isProfileHovered ? 'translateY(0)' : 'translateY(8px)',
            pointerEvents: isProfileHovered ? 'auto' : 'none',
            transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 10,
          }}
        >
          <ListItemButton
            onClick={() => { navigate('/admin/account'); setIsProfileHovered(false); }}
            sx={{
              py: 1.5,
              px: 2,
              fontFamily: '"Urbanist", sans-serif',
              color: '#0F172A',
              fontWeight: 600,
              borderRadius: 0,
              '&:hover': {
                backgroundColor: '#F7F4FD',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <PersonIcon fontSize="small" sx={{ color: '#6818A5' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Profile"
              sx={{
                '& .MuiListItemText-primary': {
                  fontFamily: '"Urbanist", sans-serif',
                  fontWeight: 600,
                }
              }}
            />
          </ListItemButton>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              py: 1.5,
              px: 2,
              fontFamily: '"Urbanist", sans-serif',
              color: '#0F172A',
              fontWeight: 600,
              borderRadius: 0,
              '&:hover': {
                backgroundColor: '#F7F4FD',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LogoutIcon fontSize="small" sx={{ color: '#EA4335' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Logout"
              sx={{
                '& .MuiListItemText-primary': {
                  fontFamily: '"Urbanist", sans-serif',
                  fontWeight: 600,
                }
              }}
            />
          </ListItemButton>
        </Box>

        {/* Profile Display */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: sidebarOpen ? 2 : 0,
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            cursor: 'pointer',
            borderRadius: 2,
            p: 1,
            backgroundColor: isProfileHovered && sidebarOpen ? '#F7F4FD' : 'transparent',
            transition: 'background-color 0.2s ease',
          }}
          onClick={() => !sidebarOpen && navigate('/admin/account')}
        >
          <Avatar sx={{ 
            bgcolor: '#6818A5', 
            width: 40, 
            height: 40,
            fontWeight: 600,
            color: '#FFFFFF'
          }}>
            {getUserInitials()}
          </Avatar>
          {sidebarOpen && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ 
                fontWeight: 700,
                color: '#0F172A',
                fontFamily: '"Urbanist", sans-serif',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                transition: 'opacity 0.3s ease',
                opacity: sidebarOpen ? 1 : 0,
              }}>
                {user?.name || 'Admin User'}
              </Typography>
              <Typography variant="caption" sx={{ 
                color: '#1E293B',
                fontFamily: '"Urbanist", sans-serif',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
                fontWeight: 600,
                transition: 'opacity 0.3s ease',
                opacity: sidebarOpen ? 1 : 0,
              }}>
                {user?.email || 'admin@example.com'}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );

  if (!isAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" color="error">
          Access Denied
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          You do not have admin privileges to access this area.
        </Typography>
      </Box>
    );
  }

  const currentDrawerWidth = sidebarOpen ? drawerWidthExpanded : drawerWidthCollapsed;

  return (
    <Box sx={{ display: 'flex' }}>
      <Box
        component="nav"
        sx={{ width: { md: currentDrawerWidth }, flexShrink: { md: 0 }, transition: 'width 0.3s ease' }}
        aria-label="navigation"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidthExpanded,
              backgroundColor: '#FFFFFF',
              borderRight: '1px solid #E5E5E5'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: currentDrawerWidth,
              backgroundColor: '#FFFFFF',
              borderRight: '1px solid #E5E5E5',
              transition: 'width 0.3s ease',
              overflowX: 'hidden',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: '#F6F9FF',
          position: 'relative',
          zIndex: 1,
          transition: 'width 0.3s ease',
        }}
      >
        <Box sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          maxWidth: '100%',
          mx: 'auto',
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;
