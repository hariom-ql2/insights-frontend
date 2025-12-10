import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6818A5',
      light: '#F7F4FD',
      dark: '#5a1594',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FACC15',
      light: '#FEF3C7',
      dark: '#F59E0B',
      contrastText: '#232323',
    },
    error: {
      main: '#EA4335',
      light: '#FEE2E2',
      dark: '#DC2626',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F6F9FF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#1E293B',
    },
    grey: {
      50: '#F6F9FF',
      100: '#F7F4FD',
      200: '#E5E5E5',
      300: '#CBD5E1',
      400: '#64748B',
      500: '#475569',
      600: '#334155',
      700: '#1E293B',
      800: '#0F172A',
      900: '#020617',
    },
  },
  typography: {
    fontFamily: '"Urbanist", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '2.5rem',
      letterSpacing: '-0.02em',
      color: '#0F172A',
    },
    h2: {
      fontWeight: 800,
      fontSize: '2rem',
      letterSpacing: '-0.01em',
      color: '#0F172A',
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.75rem',
      letterSpacing: '-0.01em',
      color: '#0F172A',
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.5rem',
      letterSpacing: '-0.01em',
      color: '#0F172A',
    },
    h5: {
      fontWeight: 700,
      fontSize: '1.25rem',
      color: '#0F172A',
    },
    h6: {
      fontWeight: 700,
      fontSize: '1.125rem',
      color: '#0F172A',
    },
    subtitle1: {
      fontWeight: 700,
      fontSize: '1rem',
      letterSpacing: '0.01em',
      color: '#1E293B',
    },
    subtitle2: {
      fontWeight: 700,
      fontSize: '0.875rem',
      letterSpacing: '0.01em',
      color: '#1E293B',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      fontWeight: 600,
      color: '#1E293B',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      fontWeight: 600,
      color: '#1E293B',
    },
    button: {
      fontWeight: 700,
      textTransform: 'none',
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '12px 24px',
          fontFamily: '"Urbanist", sans-serif',
          fontWeight: 700,
          textTransform: 'none',
          boxShadow: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: 'none',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          backgroundColor: '#6818A5',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#5a1594',
          },
        },
        outlined: {
          borderWidth: 2,
          borderColor: '#6818A5',
          color: '#6818A5',
          '&:hover': {
            borderWidth: 2,
            backgroundColor: '#F7F4FD',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#FFFFFF',
            '& fieldset': {
              borderColor: '#E5E5E5',
            },
            '&:hover fieldset': {
              borderColor: '#6818A5',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#6818A5',
              borderWidth: 2,
            },
          },
          '& .MuiInputLabel-root': {
            color: '#475569',
            fontWeight: 700,
            '&.Mui-focused': {
              color: '#6818A5',
            },
          },
          '& .MuiOutlinedInput-input::placeholder': {
            color: '#475569',
            fontWeight: 600,
          },
          '& .MuiOutlinedInput-input': {
            fontWeight: 600,
            color: '#0F172A',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#E5E5E5',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#6818A5',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#6818A5',
            borderWidth: 2,
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          color: '#0F172A',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#FFFFFF',
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
        elevation2: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontFamily: '"Urbanist", sans-serif',
          fontWeight: 700,
          '&.MuiChip-colorDefault': {
            color: '#0F172A',
            backgroundColor: '#E2E8F0',
          },
          '&.MuiChip-colorPrimary': {
            color: '#FFFFFF',
            backgroundColor: '#6818A5',
          },
          '&.MuiChip-colorSecondary': {
            color: '#FFFFFF',
            backgroundColor: '#6B7280',
          },
          '&.MuiChip-colorSuccess': {
            color: '#FFFFFF',
            backgroundColor: '#10B981',
          },
          '&.MuiChip-colorError': {
            color: '#FFFFFF',
            backgroundColor: '#EF4444',
          },
          '&.MuiChip-colorWarning': {
            color: '#FFFFFF',
            backgroundColor: '#F59E0B',
          },
          '&.MuiChip-colorInfo': {
            color: '#FFFFFF',
            backgroundColor: '#3B82F6',
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          '&.Mui-checked': {
            color: '#6818A5',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
          },
          '& .MuiTypography-root': {
            color: '#1E293B',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          color: '#1E293B',
        },
        head: {
          fontWeight: 700,
          color: '#0F172A',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#1E293B',
        },
      },
    },
    // Override MUI Date/Time Picker action bar buttons
    MuiPickersActionBar: {
      styleOverrides: {
        root: {
          '& .MuiButton-root': {
            color: '#6818A5',
            backgroundColor: 'transparent',
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#F7F4FD',
            },
            '&.MuiButton-textPrimary': {
              color: '#6818A5',
              backgroundColor: 'transparent',
            },
          },
        },
      },
    },
  },
});

export default theme; 