import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TimeDisplay from '../components/TimeDisplay';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
}

interface WalletData {
  balance: number;
  frozen_amount?: number;
  transactions: Transaction[];
}

const MyWallet = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, token } = useAuth();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addMoneyOpen, setAddMoneyOpen] = useState(false);
  const [addMoneyLoading, setAddMoneyLoading] = useState(false);
  const [addMoneyForm, setAddMoneyForm] = useState({
    amount: '',
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/auth');
      return;
    }
    fetchWalletData();
  }, [navigate, isAuthenticated, user, token]);

  const fetchWalletData = async () => {
    try {
      if (!token) {
        setError('Please login to view wallet');
        setLoading(false);
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
      const response = await fetch(`${API_BASE_URL}/wallet`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        const walletData: WalletData = {
          balance: data.balance || 0,
          frozen_amount: data.frozen_amount || 0,
          transactions: (data.transactions || []).map((txn: any) => ({
            id: txn.id.toString(),
            type: txn.type,
            amount: txn.amount,
            description: txn.description || '',
            timestamp: txn.timestamp,
            status: txn.status || 'completed',
          })),
        };
        setWalletData(walletData);
      } else {
        setError(data.message || 'Error loading wallet data');
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      setError('Error loading wallet data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (timestamp: string) => {
    return <TimeDisplay timestamp={timestamp} format="datetime" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'credit' ? 'success' : 'error';
  };

  const handleAddMoney = () => {
    setAddMoneyOpen(true);
  };

  const handleCloseAddMoney = () => {
    setAddMoneyOpen(false);
    setAddMoneyForm({
      amount: '',
      paymentMethod: 'card',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    });
  };

  const handleAddMoneySubmit = async () => {
    if (!addMoneyForm.amount || parseFloat(addMoneyForm.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!token) {
      setError('Please login to add money');
      return;
    }

    setAddMoneyLoading(true);
    setError(null);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
      const response = await fetch(`${API_BASE_URL}/wallet/add-money`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(addMoneyForm.amount),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh wallet data to get updated balance and transactions
        await fetchWalletData();
        handleCloseAddMoney();
        // Show success message (you could use a toast notification here)
        alert(data.message || 'Money added successfully!');
      } else {
        // Check for numeric overflow error and show user-friendly message
        const errorMessage = data.message || 'Failed to add money. Please try again.';
        if (errorMessage.includes('numeric field overflow') || errorMessage.includes('SQLSTATE 22003')) {
          setError('The wallet balance limit has been reached. Please contact support for assistance.');
        } else {
          setError(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error adding money:', error);
      setError('Failed to add money. Please try again.');
    } finally {
      setAddMoneyLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', maxWidth: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ width: '100%', maxWidth: '100%' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Typography variant="h4" sx={{ fontWeight: 800, color: '#6818A5', mb: 4, fontFamily: '"Urbanist", sans-serif' }}>
        My Wallet
      </Typography>

      {/* Balance Card */}
      <Card sx={{ mb: 4, background: '#f7f4fd', color: 'white' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, opacity: 0.9, fontFamily: '"Urbanist", sans-serif', fontWeight: 700 }}>
              Current Balance
            </Typography>
            <Button
              variant="contained"
              onClick={handleAddMoney}
              sx={{
                backgroundColor: '#6818A5',
                color: 'white',
                fontFamily: '"Urbanist", sans-serif',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: 2,
                px: 3,
                py: 1,
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  backgroundColor: '#5a1594',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Add Money
            </Button>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 800, fontFamily: '"Urbanist", sans-serif' }}>
            {walletData ? formatCurrency(walletData.balance) : '$0.00'}
          </Typography>
          {/* show nothing when frozen_amount is 0 but show the frozen amount when it is greater than 0 */}
          {walletData && walletData.frozen_amount && walletData.frozen_amount > 0 ? (
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.8, fontFamily: '"Urbanist", sans-serif' }}>
              Frozen Amount: {formatCurrency(walletData.frozen_amount)}
            </Typography>
          ) : null}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, pb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 0, fontFamily: '"Urbanist", sans-serif' }}>
              Transaction History
            </Typography>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F7F4FD' }}>
                  <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {walletData?.transactions.map((transaction) => (
                  <TableRow 
                    key={transaction.id}
                    sx={{ 
                      '&:hover': { backgroundColor: '#F8FAFC' },
                      '&:last-child td, &:last-child th': { border: 0 }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                      <Chip 
                        label={transaction.type.toUpperCase()} 
                        color={getTypeColor(transaction.type) === 'success' ? 'success' : 'error'}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          fontWeight: 600, 
                          // borderColor: getTypeColor(transaction.type) === 'success' ? '#10B981' : '#EF4444',
                          // color: getTypeColor(transaction.type) === 'success' ? '#FFFFFF' : '#FFFFFF',
                          // backgroundColor: getTypeColor(transaction.type) === 'success' ? '#10B981' : '#EF4444',
                          '& .MuiChip-label': { color: getTypeColor(transaction.type) === 'success' ? '#FFFFFF' : '#FFFFFF' }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>{transaction.description}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                      {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                      <Chip 
                        label={transaction.status.toUpperCase()} 
                        color={getStatusColor(transaction.status) as any}
                        variant={getStatusColor(transaction.status) === 'default' ? 'outlined' : 'filled'}
                        size="small"
                        sx={{ 
                          fontWeight: 600,
                          ...(getStatusColor(transaction.status) === 'default' ? {
                            borderColor: '#E2E8F0',
                            color: '#1E293B',
                            backgroundColor: 'transparent'
                          } : {
                            color: '#FFFFFF',
                            '& .MuiChip-label': { color: '#FFFFFF !important' }
                          })
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>{formatDate(transaction.timestamp)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {walletData?.transactions.length === 0 && (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              No transactions found
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Add Money Dialog */}
      <Dialog 
        open={addMoneyOpen} 
        onClose={handleCloseAddMoney}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontFamily: '"Urbanist", sans-serif', 
          fontWeight: 800, 
          color: '#0F172A',
          pb: 2
        }}>
          Add Money to Wallet
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              placeholder="Enter amount to add"
              value={addMoneyForm.amount}
              onChange={(e) => setAddMoneyForm({ ...addMoneyForm, amount: e.target.value })}
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
                '& .MuiInputLabel-root': {
                  fontFamily: '"Urbanist", sans-serif',
                  color: '#1E293B'
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#6818A5'
                }
              }}
            />

            <FormControl fullWidth>
              <InputLabel sx={{ 
                fontFamily: '"Urbanist", sans-serif',
                color: '#1E293B',
                '&.Mui-focused': {
                  color: '#6818A5'
                }
              }}>
                {/* Payment Method */}
              </InputLabel>
              <Select
                value={addMoneyForm.paymentMethod}
                onChange={(e) => setAddMoneyForm({ ...addMoneyForm, paymentMethod: e.target.value })}
                sx={{
                  borderRadius: 2,
                  fontFamily: '"Urbanist", sans-serif',
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
                  }
                }}
              >
                <MenuItem value="card" sx={{ fontFamily: '"Urbanist", sans-serif' }}>Credit/Debit Card</MenuItem>
                <MenuItem value="paypal" sx={{ fontFamily: '"Urbanist", sans-serif' }}>PayPal</MenuItem>
                <MenuItem value="bank" sx={{ fontFamily: '"Urbanist", sans-serif' }}>Bank Transfer</MenuItem>
              </Select>
            </FormControl>

            {addMoneyForm.paymentMethod === 'card' && (
              <>
                <TextField
                  fullWidth
                  label="Card Number"
                  placeholder="1234 5678 9012 3456"
                  value={addMoneyForm.cardNumber}
                  onChange={(e) => setAddMoneyForm({ ...addMoneyForm, cardNumber: e.target.value })}
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
                    '& .MuiInputLabel-root': {
                      fontFamily: '"Urbanist", sans-serif',
                      color: '#919191'
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#6818A5'
                    }
                  }}
                />
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Expiry Date"
                    placeholder="MM/YY"
                    value={addMoneyForm.expiryDate}
                    onChange={(e) => setAddMoneyForm({ ...addMoneyForm, expiryDate: e.target.value })}
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
                      '& .MuiInputLabel-root': {
                        fontFamily: '"Urbanist", sans-serif',
                        color: '#919191'
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#6818A5'
                      }
                    }}
                  />
                  <TextField
                    fullWidth
                    label="CVV"
                    placeholder="123"
                    value={addMoneyForm.cvv}
                    onChange={(e) => setAddMoneyForm({ ...addMoneyForm, cvv: e.target.value })}
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
                      '& .MuiInputLabel-root': {
                        fontFamily: '"Urbanist", sans-serif',
                        color: '#919191'
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#6818A5'
                      }
                    }}
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Cardholder Name"
                  placeholder="John Doe"
                  value={addMoneyForm.cardholderName}
                  onChange={(e) => setAddMoneyForm({ ...addMoneyForm, cardholderName: e.target.value })}
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
                    '& .MuiInputLabel-root': {
                      fontFamily: '"Urbanist", sans-serif',
                      color: '#919191'
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#6818A5'
                    }
                  }}
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={handleCloseAddMoney}
            sx={{
              fontFamily: '"Urbanist", sans-serif',
              fontWeight: 700,
              color: '#1E293B',
              borderColor: '#E2E8F0',
              '&:hover': {
                borderColor: '#CBD5E1',
                backgroundColor: '#F8FAFC'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddMoneySubmit}
            disabled={addMoneyLoading || !addMoneyForm.amount}
            variant="contained"
            sx={{
              fontFamily: '"Urbanist", sans-serif',
              fontWeight: 600,
              backgroundColor: '#6818A5',
              borderRadius: 2,
              px: 4,
              '&:hover': {
                backgroundColor: '#5a1594'
              },
              '&:disabled': {
                backgroundColor: '#94A3B8'
              }
            }}
          >
            {addMoneyLoading ? 'Processing...' : 'Add Money'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyWallet;
