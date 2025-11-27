import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import theme from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
// import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import UserLayout from './components/UserLayout';
import MultiSearchForm from './components/MultiSearchForm';
import Dashboard from './pages/Dashboard';
import Signup from './pages/Signup';
import Login from './pages/Login';
import EmailVerification from './pages/EmailVerification';
import MyCollections from './pages/MyCollections';
import MySearches from './pages/MySearches';
import MySchedules from './pages/MySchedules';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Pricing from './pages/Pricing';
import Account from './pages/Account';
import MyWallet from './pages/MyWallet';
import TestAuth from './pages/TestAuth';
import TimeZoneDemo from './pages/TimeZoneDemo';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminSearches from './pages/AdminSearches';
import AdminCollections from './pages/AdminCollections';
import AdminActivities from './pages/AdminActivities';
import AdminSchedules from './pages/AdminSchedules';
import ReportsLoggedIn from './pages/ReportsLoggedIn';

// Home component that redirects based on auth status
const Home = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <MultiSearchForm />;
};

// Component to conditionally show Header
const AppContent = () => {
  const location = useLocation();
  const hideHeaderRoutes = ['/dashboard', '/create-collection', '/collections', '/searches', '/schedules', '/account', '/wallet', '/reports'];
  const isLayoutRoute = hideHeaderRoutes.some(route => location.pathname.startsWith(route) || location.pathname.startsWith('/admin'));
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        overflowX: 'hidden',
        backgroundColor: '#F6F9FF',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {!isLayoutRoute && <Header />}
      <Box
        component="main"
        sx={{
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          pt: isLayoutRoute ? 0 : { xs: 2, sm: 3 },
          pb: isLayoutRoute ? 0 : { xs: 4, sm: 6 },
          px: isLayoutRoute ? 0 : { xs: 2, sm: 3 }
        }}
      >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/auth" element={<Login />} />
                <Route path="/verify-email" element={<EmailVerification />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/pricing" element={<Pricing />} />
                
                {/* Protected Routes with UserLayout */}
                <Route path="/dashboard" element={<ProtectedRoute><UserLayout><Dashboard /></UserLayout></ProtectedRoute>} />
                <Route path="/create-collection" element={<ProtectedRoute><UserLayout><MultiSearchForm /></UserLayout></ProtectedRoute>} />
                <Route path="/collections" element={<ProtectedRoute><UserLayout><MyCollections /></UserLayout></ProtectedRoute>} />
                <Route path="/searches" element={<ProtectedRoute><UserLayout><MySearches /></UserLayout></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><UserLayout><ReportsLoggedIn /></UserLayout></ProtectedRoute>} />
                <Route path="/schedules" element={<ProtectedRoute><UserLayout><MySchedules /></UserLayout></ProtectedRoute>} />
                <Route path="/account" element={<ProtectedRoute><UserLayout><Account /></UserLayout></ProtectedRoute>} />
                <Route path="/wallet" element={<ProtectedRoute><UserLayout><MyWallet /></UserLayout></ProtectedRoute>} />
                <Route path="/test-auth" element={<TestAuth />} />
                <Route path="/timezone-demo" element={<TimeZoneDemo />} />
                
                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<ProtectedRoute><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute><AdminLayout><AdminUsers /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/searches" element={<ProtectedRoute><AdminLayout><AdminSearches /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/collections" element={<ProtectedRoute><AdminLayout><AdminCollections /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/schedules" element={<ProtectedRoute><AdminLayout><AdminSchedules /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/activities" element={<ProtectedRoute><AdminLayout><AdminActivities /></AdminLayout></ProtectedRoute>} />
                <Route path="/admin/account" element={<ProtectedRoute><AdminLayout><Account /></AdminLayout></ProtectedRoute>} />
              </Routes>
      </Box>
      {/* <Footer /> */}
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
