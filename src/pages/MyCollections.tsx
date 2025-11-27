import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  TextField,
  FormControl,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Pagination,
  Stack,
  Menu
} from '@mui/material';
import {
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  FileUpload as FileUploadIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  LocationOn as LocationOnIcon,
  CalendarMonth as CalendarMonthIcon,
  FilterList as FilterListIcon,
  ArrowUpward,
  ArrowDownward,
  UnfoldMore
} from '@mui/icons-material';
import axios from 'axios';
import { format, startOfToday } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useAuth } from '../contexts/AuthContext';
import TimeDisplay from '../components/TimeDisplay';
import { apiService, schedulesApi } from '../services/api';
import ScheduleScheduler from '../components/ScheduleScheduler';
import editIcon from '../../icons/edit.svg';
import deleteIcon from '../../icons/delete.svg';
import scheduleIcon from '../../icons/schedule.svg';
import viewIcon from '../../icons/view.svg';
import starIcon from '../../icons/star.svg';
import playCircleIcon from '../../icons/play_circle.svg';
import bookmarkIcon from '../../icons/bookmark.svg';

// Star Rating Display Component
const StarRatingDisplay = ({ rating }: { rating: string }) => {
  // Parse rating (e.g., "3", "4+", "5")
  const numStars = parseInt(rating.replace('+', '')) || 0;
  const hasPlus = rating.includes('+');
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {Array.from({ length: numStars }).map((_, index) => (
        <img 
          key={index} 
          src={starIcon} 
          alt="star" 
          style={{ width: 16, height: 16 }} 
        />
      ))}
      {hasPlus && (
        <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600, ml: 0.5 }}>
          +
        </Typography>
      )}
    </Box>
  );
};

// Custom Action Button Component
const ActionButton = ({ 
  onClick, 
  disabled, 
  children, 
  color = '#232323', 
  hoverColor = '#6818A5',
  title
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  color?: string;
  hoverColor?: string;
  title?: string;
}) => (
  <IconButton
    size="small"
    onClick={onClick}
    disabled={disabled}
    title={title}
    sx={{
      color: color,
      backgroundColor: 'rgba(35, 35, 35, 0.05)',
      borderRadius: 2,
      padding: '6px',
      minWidth: '24px',
      height: '24px',
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: 'rgba(104, 24, 165, 0.1)',
        color: hoverColor,
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 8px rgba(104, 24, 165, 0.2)'
      },
      '&:disabled': {
        backgroundColor: 'rgba(145, 145, 145, 0.05)',
        color: '#919191'
      }
    }}
  >
    {children}
  </IconButton>
);

interface SearchItem {
  id: number;
  location: string;
  check_in_date: string;
  check_out_date: string;
  adults: number;
  star_rating: string;
  website: string;
  pos: string[];
}

interface Collection {
  id: number;
  name: string;
  description: string;
  status: 'saved' | 'submitted' | 'scheduled';
  scheduled_date: string | null;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
  search_count: number;
  searches: SearchItem[];
}

const MyCollections: React.FC = () => {
  const { user, token, isAuthenticated } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Filter states
  const [filters, setFilters] = useState({
    collectionName: '',
    status: 'all' as 'all' | 'saved' | 'submitted' | 'scheduled',
    location: '',
    website: '',
    checkInStart: null as Date | null,
    checkInEnd: null as Date | null,
    checkOutStart: null as Date | null,
    checkOutEnd: null as Date | null
  });
  // Status filter menu state
  const [statusFilterAnchor, setStatusFilterAnchor] = useState<null | HTMLElement>(null);
  
  // Sorting state
  const [sortColumn, setSortColumn] = useState<'created' | 'last_run' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  
  // Schedule dialog state
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [collectionToSchedule, setCollectionToSchedule] = useState<Collection | null>(null);
  
  // State for editing collection items
  const [showEditItemDialog, setShowEditItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<SearchItem | null>(null);
  const [sites, setSites] = useState<{ code: string; name: string }[]>([]);
  const [editingCollectionName, setEditingCollectionName] = useState('');
  const [editFormData, setEditFormData] = useState({
    location: '',
    checkInDate: null as Date | null,
    checkOutDate: null as Date | null,
    adults: 2,
    starRating: 1,
    starRatingOrMore: false,
    selectedWebsites: [] as { code: string; name: string }[],
    posMapping: {} as Record<string, string[]>
  });

  // State for adding items to collection
  const [editDialogTab, setEditDialogTab] = useState(0); // 0 = View Items, 1 = Add Items
  const [addItemsTab, setAddItemsTab] = useState(0); // 0 = Manual, 1 = CSV Upload
  const [newItems, setNewItems] = useState<SearchItem[]>([]);
  const [newItemForm, setNewItemForm] = useState({
    city: '',
    countryCode: '',
    selectedWebsite: null as { name: string } | null,
    selectedPOS: [] as string[],
    checkInDate: null as Date | null,
    checkOutDate: null as Date | null,
    adults: 2,
    starRating: 1,
    starRatingOrMore: false
  });
  const [posOptions, setPosOptions] = useState<string[]>([]);
  const [addingItems, setAddingItems] = useState(false);
  const [editItemPosOptions, setEditItemPosOptions] = useState<string[]>([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchCollections();
      fetchSites(); // Fetch sites on component mount
    }
  }, [isAuthenticated, user]);

  const fetchSites = async () => {
    try {
      // Use the same API call pattern as MultiSearchForm
      const response = await axios.get('http://localhost:5001/sites');
      const allSites = response.data.sites || [];
      
      // Convert to the format expected by the form
      const sitesFormatted = allSites.map((siteName: string) => ({
        code: siteName,
        name: siteName
      }));
      
      setSites(sitesFormatted);
    } catch (error) {
      console.error('Error fetching sites:', error);
      setSites([]);
    }
  };

  // Fetch POS when selectedWebsite changes in add items form
  useEffect(() => {
    if (newItemForm.selectedWebsite) {
      axios.get('http://localhost:5001/pos', { params: { site_name: newItemForm.selectedWebsite.name } })
        .then(res => setPosOptions(res.data.pos || []))
        .catch(() => setPosOptions([]));
    } else {
      setPosOptions([]);
    }
  }, [newItemForm.selectedWebsite]);

  // Fetch POS when editing item website changes
  useEffect(() => {
    if (editFormData.selectedWebsites.length > 0) {
      axios.get('http://localhost:5001/pos', { params: { site_name: editFormData.selectedWebsites[0].name } })
        .then(res => setEditItemPosOptions(res.data.pos || []))
        .catch(() => setEditItemPosOptions([]));
    } else {
      setEditItemPosOptions([]);
    }
  }, [editFormData.selectedWebsites]);

  // Country codes list
  const countryCodes = [
    'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ',
    'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS',
    'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN',
    'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE',
    'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF',
    'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM',
    'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM',
    'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC',
    'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK',
    'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA',
    'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG',
    'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW',
    'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS',
    'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO',
    'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI',
    'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM', 'ZW'
  ];

  const validateNewItem = () => {
    return (
      newItemForm.selectedWebsite &&
      newItemForm.city &&
      newItemForm.countryCode &&
      newItemForm.checkInDate &&
      newItemForm.checkOutDate &&
      newItemForm.adults > 0 &&
      newItemForm.starRating > 0
    );
  };

  const handleAddNewItem = () => {
    if (!validateNewItem()) {
      alert('Please fill all required fields before adding an item.');
      return;
    }
    const newItem: SearchItem = {
      id: Date.now(),
      location: `${newItemForm.city}, ${newItemForm.countryCode}`,
      check_in_date: format(newItemForm.checkInDate!, 'yyyy-MM-dd'),
      check_out_date: format(newItemForm.checkOutDate!, 'yyyy-MM-dd'),
      adults: newItemForm.adults,
      star_rating: newItemForm.starRatingOrMore ? `${newItemForm.starRating}+` : newItemForm.starRating.toString(),
      website: newItemForm.selectedWebsite!.name,
      pos: newItemForm.selectedPOS
    };
    setNewItems([...newItems, newItem]);
    // Reset form
    setNewItemForm({
      city: '',
      countryCode: '',
      selectedWebsite: null,
      selectedPOS: [],
      checkInDate: null,
      checkOutDate: null,
      adults: 2,
      starRating: 1,
      starRatingOrMore: false
    });
  };

  const handleRemoveNewItem = (index: number) => {
    setNewItems(newItems.filter((_, i) => i !== index));
  };

  const handleAddItemsToCollection = async () => {
    if (!editingCollection || newItems.length === 0) return;
    
    setAddingItems(true);
    try {
      const jobs = newItems.map(item => ({
        website: { name: item.website, pos: item.pos || [] },
        location: item.location,
        checkInDate: item.check_in_date,
        checkOutDate: item.check_out_date,
        adults: item.adults,
        starRating: item.star_rating
      }));

      const response = await apiService.post(`/collection/${editingCollection.id}/items`, { jobs }, token);
      
      if (response.success) {
        alert(response.message || 'Items added successfully!');
        setNewItems([]);
        setEditDialogTab(0); // Switch back to View Items tab
        // Refresh collection data
        const updatedCollection = await apiService.get(`/collection/${editingCollection.id}`, token);
        if (updatedCollection.success) {
          setEditingCollection((updatedCollection as any).collection);
        }
        fetchCollections(); // Refresh the list
      } else {
        alert(response.message || 'Failed to add items');
      }
    } catch (error: any) {
      console.error('Error adding items:', error);
      alert(error.response?.data?.message || 'Error adding items. Please try again.');
    } finally {
      setAddingItems(false);
    }
  };

  // CSV parsing function (similar to MultiSearchForm)
  const parseCSVFile = (file: File): Promise<SearchItem[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim() !== '');
          
          if (lines.length > 50) {
            alert(`Warning: CSV has ${lines.length} rows. Only the first 50 rows will be processed.`);
          }
          
          const rowsToProcess = lines.slice(0, 50);
          const parsedItems: SearchItem[] = [];
          
          for (let i = 0; i < rowsToProcess.length; i++) {
            const line = rowsToProcess[i].trim();
            if (!line) continue;
            
            const columns = line.split(',').map(col => col.trim());
            
            // Expected format: Site, City, Country, CheckIn (YYYYMMDD), CheckOut (YYYYMMDD), StarRating, Adults [, POS]
            if (columns.length < 7) {
              alert(`Row ${i + 1} has invalid format. Skipping.`);
              continue;
            }
            
            const site = columns[0];
            const city = columns[1];
            const country = columns[2];
            const checkInStr = columns[3];
            const checkOutStr = columns[4];
            const starRatingStr = columns[5];
            const adultsStr = columns[6];
            const posValue = columns.length > 7 ? columns[7] : '';
            
            // Parse dates from YYYYMMDD format
            let checkInDate: Date | null = null;
            let checkOutDate: Date | null = null;
            
            if (checkInStr && checkInStr.length === 8) {
              const year = parseInt(checkInStr.substring(0, 4));
              const month = parseInt(checkInStr.substring(4, 6)) - 1;
              const day = parseInt(checkInStr.substring(6, 8));
              if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                checkInDate = new Date(year, month, day);
                if (checkInDate.getFullYear() !== year || checkInDate.getMonth() !== month || checkInDate.getDate() !== day) {
                  checkInDate = null;
                }
              }
            }
            
            if (checkOutStr && checkOutStr.length === 8) {
              const year = parseInt(checkOutStr.substring(0, 4));
              const month = parseInt(checkOutStr.substring(4, 6)) - 1;
              const day = parseInt(checkOutStr.substring(6, 8));
              if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                checkOutDate = new Date(year, month, day);
                if (checkOutDate.getFullYear() !== year || checkOutDate.getMonth() !== month || checkOutDate.getDate() !== day) {
                  checkOutDate = null;
                }
              }
            }
            
            // Parse star rating
            let starRating = parseInt(starRatingStr) || 1;
            let starRatingOrMore = false;
            if (starRatingStr && starRatingStr.includes('+')) {
              starRatingOrMore = true;
              starRating = parseInt(starRatingStr.replace('+', '')) || 1;
            }
            
            const adults = parseInt(adultsStr) || 2;
            const pos = posValue && ['IN', 'UK', 'US'].includes(posValue.toUpperCase()) ? [posValue.toUpperCase()] : [];
            
            // Convert site code to full name
            const siteCodeToName: Record<string, string> = {
              'EXP': 'EXPEDIA',
              'PL': 'PRICELINE',
              'MC': 'MARRIOTT',
              'CH': 'CHOICEHOTELS',
              'BW': 'BESTWESTERN',
              'RR': 'REDROOF',
              'RT': 'ACCORHOTELS',
            };
            
            const siteUpper = site.toUpperCase();
            const knownFullNames = ['EXPEDIA', 'PRICELINE', 'MARRIOTT', 'CHOICEHOTELS', 'BESTWESTERN', 'REDROOF', 'ACCORHOTELS', 'BOOKING'];
            const siteName = knownFullNames.includes(siteUpper) 
              ? siteUpper 
              : (siteCodeToName[siteUpper] || siteUpper);
            
            if (checkInDate && checkOutDate) {
              parsedItems.push({
                id: Date.now() + i,
                location: `${city}, ${country}`,
                check_in_date: format(checkInDate, 'yyyy-MM-dd'),
                check_out_date: format(checkOutDate, 'yyyy-MM-dd'),
                adults,
                star_rating: starRatingOrMore ? `${starRating}+` : starRating.toString(),
                website: siteName,
                pos
              });
            }
          }
          
          resolve(parsedItems);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file.');
      return;
    }
    
    try {
      const parsedItems = await parseCSVFile(file);
      if (parsedItems.length === 0) {
        alert('No valid items found in CSV file.');
        return;
      }
      setNewItems([...newItems, ...parsedItems]);
      alert(`Successfully parsed ${parsedItems.length} item(s) from CSV.`);
    } catch (error) {
      console.error('CSV parsing error:', error);
      alert('Failed to parse CSV file. Please check the format.');
    } finally {
      // Reset file input
      event.target.value = '';
    }
  };

  const fetchCollections = async (filterParams?: any) => {
    try {
      if (!user?.email || !token) {
        setLoading(false);
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      const activeFilters = filterParams || filters;
      
      if (activeFilters.location) params.append('location', activeFilters.location);
      if (activeFilters.website) params.append('website', activeFilters.website);
      if (activeFilters.checkInStart) {
        const date = activeFilters.checkInStart instanceof Date 
          ? activeFilters.checkInStart
          : new Date(activeFilters.checkInStart);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`; // YYYY-MM-DD in local timezone
        params.append('checkInStart', dateStr);
      }
      if (activeFilters.checkOutStart) {
        const date = activeFilters.checkOutStart instanceof Date 
          ? activeFilters.checkOutStart
          : new Date(activeFilters.checkOutStart);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`; // YYYY-MM-DD in local timezone
        params.append('checkOutStart', dateStr);
      }

      const response = await apiService.get(`/my-collections?${params.toString()}`, token);
      if (response.success) {
        setCollections((response as any).collections);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce effect for text inputs
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (filters.collectionName || filters.location || filters.website) {
        setCurrentPage(1);
        fetchCollections(filters);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [filters.collectionName, filters.location, filters.website]);

  // Auto-apply for non-text filters (status, dates)
  useEffect(() => {
    setCurrentPage(1);
    fetchCollections(filters);
  }, [filters.status, filters.checkInStart, filters.checkInEnd, filters.checkOutStart, filters.checkOutEnd]);

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      collectionName: '',
      status: 'all' as 'all' | 'saved' | 'submitted' | 'scheduled',
      location: '',
      website: '',
      checkInStart: null as Date | null,
      checkInEnd: null as Date | null,
      checkOutStart: null as Date | null,
      checkOutEnd: null as Date | null
    };
    setFilters(clearedFilters);
    setCurrentPage(1);
    setLoading(true);
    fetchCollections();
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  // Apply filters to collections
  // Note: Date filters are handled by the backend API, so we only filter by collection name and status here
  let filteredCollections = collections.filter(collection => {
    // Collection name filter
    if (filters.collectionName && !collection.name.toLowerCase().includes(filters.collectionName.toLowerCase())) {
      return false;
    }
    // Status filter
    if (filters.status !== 'all' && collection.status !== filters.status) {
      return false;
    }
    // Date filters are handled by backend - if a collection is returned, it means it has matching items
    return true;
  });

  // Apply sorting
  if (sortColumn) {
    filteredCollections = [...filteredCollections].sort((a, b) => {
      let aValue: number;
      let bValue: number;
      
      if (sortColumn === 'created') {
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
      } else { // last_run
        aValue = a.last_run_at ? new Date(a.last_run_at).getTime() : 0;
        bValue = b.last_run_at ? new Date(b.last_run_at).getTime() : 0;
      }
      
      if (sortDirection === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  }

  // Calculate pagination
  const totalPages = Math.ceil(filteredCollections.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCollections = filteredCollections.slice(startIndex, endIndex);

  // Status filter menu handlers
  const handleStatusFilterOpen = (event: React.MouseEvent<HTMLElement>) => {
    setStatusFilterAnchor(event.currentTarget);
  };

  const handleStatusFilterClose = () => {
    setStatusFilterAnchor(null);
  };

  const handleStatusFilterSelect = (status: 'all' | 'saved' | 'submitted' | 'scheduled') => {
    handleFilterChange('status', status);
    setStatusFilterAnchor(null);
  };

  // Sorting handlers
  const handleSort = (column: 'created' | 'last_run') => {
    if (sortColumn === column) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, start with ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleViewDetails = (collection: Collection) => {
    setSelectedCollection(collection);
    setShowDetailsDialog(true);
  };

  const handleSubmitCollection = async (collectionId: number) => {
    setSubmitting(collectionId);
    try {
      const response = await apiService.post(`/collection/${collectionId}/submit`, {}, token);
      if (response.success) {
        alert(response.message);
        fetchCollections(); // Refresh the list
      } else {
        alert(response.message || 'Failed to submit collection');
      }
    } catch (error: any) {
      console.error('Error submitting collection:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Error submitting collection. Please try again.';
      alert(errorMessage);
    } finally {
      setSubmitting(null);
    }
  };

  const handleDeleteCollection = async (collectionId: number) => {
    if (!confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
      return;
    }

    setDeleting(collectionId);
    try {
      const response = await apiService.delete(`/collection/${collectionId}`, token);
      if (response.success) {
        alert('Collection deleted successfully');
        fetchCollections(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('Error deleting collection. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const handleEditCollection = (collection: Collection) => {
    setEditingCollection(collection);
    setEditingCollectionName(collection.name);
    setEditDialogTab(0); // Reset to View Items tab
    setAddItemsTab(0); // Reset to Manual tab
    setNewItems([]); // Clear new items
    setNewItemForm({
      city: '',
      countryCode: '',
      selectedWebsite: null,
      selectedPOS: [],
      checkInDate: null,
      checkOutDate: null,
      adults: 2,
      starRating: 1,
      starRatingOrMore: false
    });
    setShowEditDialog(true);
  };

  const handleScheduleCollection = (collection: Collection) => {
    setCollectionToSchedule(collection);
    setScheduleOpen(true);
  };

  const handleScheduleConfirm = async (scheduleData: any) => {
    if (!collectionToSchedule || !token) return;
    
    try {
      const schedulePayload = {
        name: `Collection "${collectionToSchedule.name}" - ${new Date().toLocaleDateString()}`,
        schedule_type: scheduleData.schedule_type,
        schedule_data: scheduleData.schedule_data,
        collection_id: collectionToSchedule.id
      };

      const response = await schedulesApi.createSchedule(schedulePayload, token);
      
      if (response.success) {
        alert(`Schedule "${response.data.name}" created successfully!\n\nYour collection will run according to the schedule.`);
        setScheduleOpen(false);
        setCollectionToSchedule(null);
      } else {
        alert(`Error creating schedule: ${response.message}`);
      }
    } catch (error) {
      console.error('Failed to create schedule:', error);
      alert('Error creating schedule. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setShowEditDialog(false);
    setEditingCollection(null);
    setEditingCollectionName('');
  };

  const handleEditCollectionItem = async (item: SearchItem) => {
    setEditingItem(item);
    
    // Parse dates
    const checkInDate = new Date(item.check_in_date);
    const checkOutDate = new Date(item.check_out_date);
    
    // Parse star rating
    const starRatingStr = item.star_rating;
    const starRatingOrMore = starRatingStr.includes('+');
    const starRating = parseInt(starRatingStr.replace('+', ''));
    
    // Convert websites to the format expected by the form
    const selectedWebsites = item.website ? [{
      code: item.website, // Using name as code for now
      name: item.website
    }] : [];
    
    const posMapping: Record<string, string[]> = {};
    if (item.website) {
      posMapping[item.website] = item.pos || [];
    }

    setEditFormData({
      location: item.location,
      checkInDate,
      checkOutDate,
      adults: item.adults,
      starRating,
      starRatingOrMore,
      selectedWebsites,
      posMapping
    });

    // Fetch sites for the location
    await fetchSites();
    
    // Fetch POS options for the selected website
    if (item.website) {
      try {
        const res = await axios.get('http://localhost:5001/pos', { params: { site_name: item.website } });
        setEditItemPosOptions(res.data.pos || []);
      } catch {
        setEditItemPosOptions([]);
      }
    } else {
      setEditItemPosOptions([]);
    }
    
    setShowEditItemDialog(true);
  };

  const handleUpdateCollectionItem = async () => {
    if (!editingItem || !editingCollection) return;

    try {
      // Convert form data back to the format expected by the backend
      const updatedItem = {
        location: editFormData.location,
        check_in_date: editFormData.checkInDate?.toISOString().split('T')[0],
        check_out_date: editFormData.checkOutDate?.toISOString().split('T')[0],
        adults: editFormData.adults,
        star_rating: editFormData.starRatingOrMore ? `${editFormData.starRating}+` : editFormData.starRating.toString(),
        website: editFormData.selectedWebsites.length > 0 ? editFormData.selectedWebsites[0].name : '',
        pos: editFormData.selectedWebsites.length > 0 ? (editFormData.posMapping[editFormData.selectedWebsites[0].code] || []) : []
      };

      // Update the collection item via backend
      await apiService.put(`/collection-item/${editingItem.id}`, updatedItem, token);
      
      // Update the editingCollection state immediately to reflect changes
      if (editingCollection) {
        const updatedCollection = { ...editingCollection };
        const itemIndex = updatedCollection.searches.findIndex(item => item.id === editingItem.id);
        if (itemIndex !== -1) {
          updatedCollection.searches[itemIndex] = {
            ...updatedCollection.searches[itemIndex],
            location: updatedItem.location,
            check_in_date: updatedItem.check_in_date || updatedCollection.searches[itemIndex].check_in_date,
            check_out_date: updatedItem.check_out_date || updatedCollection.searches[itemIndex].check_out_date,
            adults: updatedItem.adults,
            star_rating: updatedItem.star_rating,
            website: updatedItem.website,
            pos: updatedItem.pos
          };
          setEditingCollection(updatedCollection);
        }
      }
      
      // Refresh collections list in background
      fetchCollections();
      
      // Close dialog
      setEditingItem(null);
      setShowEditItemDialog(false);
      
      alert('Collection item updated successfully!');
    } catch (error) {
      console.error('Error updating collection item:', error);
      alert('Error updating collection item');
    }
  };

  const handleDeleteCollectionItem = async (item: SearchItem) => {
    if (!editingCollection || !token) return;
    
    if (!confirm(`Are you sure you want to delete this item from "${editingCollection.name}"?`)) {
        return;
      }

    try {
      const response = await apiService.delete(`/collection-item/${item.id}`, token);

      if (response.success) {
        // Update the editingCollection state immediately to reflect changes
        if (editingCollection) {
          const updatedCollection = { ...editingCollection };
          updatedCollection.searches = updatedCollection.searches.filter(search => search.id !== item.id);
          updatedCollection.search_count = updatedCollection.searches.length;
          setEditingCollection(updatedCollection);
        }
        
        // Refresh collections list in background
        fetchCollections();
        
        alert('Collection item deleted successfully!');
      } else {
        alert(response.message || 'Failed to delete collection item');
      }
    } catch (error: any) {
      console.error('Error deleting collection item:', error);
      alert(error.message || 'Error deleting collection item');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Compact header matching MySearches
  return (
    <Box sx={{ width: '100%', maxWidth: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#6818A5', fontFamily: '"Urbanist", sans-serif' }}>
          My Collections
        </Typography>
      </Box>

      {/* Horizontal Filter Bar */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2,
        flexWrap: 'nowrap',
        mb: 3
      }}>
        {/* Left Side: Collection Name, Location */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: '0 1 auto' }}>
          <TextField
            placeholder="Collection Name"
            value={filters.collectionName}
            onChange={(e) => handleFilterChange('collectionName', e.target.value)}
            size="small"
            sx={{
              minWidth: '220px',
              width: '220px',
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#6818A5',
                  borderWidth: 1.5,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#6818A5',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#6818A5',
                  borderWidth: 2,
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <SearchIcon sx={{ color: '#64748B', mr: 1, fontSize: 16 }} />
              ),
            }}
          />

          <TextField
            placeholder="Location"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            size="small"
            sx={{
              minWidth: '200px',
              width: '200px',
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#6818A5',
                  borderWidth: 1.5,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#6818A5',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#6818A5',
                  borderWidth: 2,
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <LocationOnIcon sx={{ color: '#64748B', mr: 1, fontSize: 16 }} />
              ),
            }}
          />
        </Box>

        {/* Right Side: Website, Check-in, Check-out, Clear All */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: '0 1 auto', ml: 'auto' }}>
          <FormControl size="small" sx={{ minWidth: '160px', width: '160px' }}>
            <Select
              value={filters.website || ''}
              onChange={(e) => handleFilterChange('website', e.target.value)}
              displayEmpty
              sx={{
                borderRadius: 2,
                fontSize: '0.875rem',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#6818A5',
                  borderWidth: 1.5,
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
              <MenuItem value="">Website</MenuItem>
              {sites.map((site) => (
                <MenuItem key={site.code} value={site.name}>{site.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={filters.checkInStart}
              onChange={(date) => handleFilterChange('checkInStart', date)}
              slotProps={{ 
                textField: { 
                  size: 'small',
                  placeholder: 'Check-in Date',
                  sx: {
                    minWidth: '160px',
                    width: '160px',
                    fontSize: '0.875rem',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6818A5',
                        borderWidth: 1.5,
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6818A5',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6818A5',
                        borderWidth: 2,
                      },
                    },
                  }
                } 
              }}
              slots={{
                openPickerIcon: () => <CalendarMonthIcon sx={{ color: '#64748B', fontSize: 16 }} />
              }}
            />
          </LocalizationProvider>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={filters.checkOutStart}
              onChange={(date) => handleFilterChange('checkOutStart', date)}
              slotProps={{ 
                textField: { 
                  size: 'small',
                  placeholder: 'Check-out Date',
                  sx: {
                    minWidth: '160px',
                    width: '160px',
                    fontSize: '0.875rem',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6818A5',
                        borderWidth: 1.5,
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6818A5',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6818A5',
                        borderWidth: 2,
                      },
                    },
                  }
                } 
              }}
              slots={{
                openPickerIcon: () => <CalendarMonthIcon sx={{ color: '#64748B', fontSize: 16 }} />
              }}
            />
          </LocalizationProvider>

          <Button
            variant="outlined"
            onClick={handleClearFilters}
            sx={{ 
              borderColor: '#6818A5',
              color: '#6818A5',
              backgroundColor: '#FFFFFF',
              borderRadius: 2,
              px: 1.5,
              py: 0.5,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.875rem',
              '&:hover': { 
                borderColor: '#5a1594',
                backgroundColor: '#F7F4FD'
              },
              fontFamily: '"Urbanist", sans-serif'
            }}
          >
            Clear All
          </Button>
        </Box>
      </Box>

      <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 2 }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#F7F4FD' }}>
                  <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Collection Name</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Inputs</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Status
                      <IconButton
                        size="small"
                        onClick={handleStatusFilterOpen}
                        sx={{
                          padding: '2px',
                          color: filters.status !== 'all' ? '#6818A5' : '#64748B',
                          '&:hover': {
                            backgroundColor: 'rgba(104, 24, 165, 0.1)',
                            color: '#6818A5'
                          }
                        }}
                      >
                        <FilterListIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                      <Menu
                        anchorEl={statusFilterAnchor}
                        open={Boolean(statusFilterAnchor)}
                        onClose={handleStatusFilterClose}
                        PaperProps={{
                          sx: { mt: 1.5, borderRadius: 2, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }
                        }}
                      >
                        <MenuItem onClick={() => handleStatusFilterSelect('all')} selected={filters.status === 'all'}>
                          All
                        </MenuItem>
                        <MenuItem onClick={() => handleStatusFilterSelect('saved')} selected={filters.status === 'saved'}>
                          Saved
                        </MenuItem>
                        <MenuItem onClick={() => handleStatusFilterSelect('submitted')} selected={filters.status === 'submitted'}>
                          Submitted
                        </MenuItem>
                        <MenuItem onClick={() => handleStatusFilterSelect('scheduled')} selected={filters.status === 'scheduled'}>
                          Scheduled
                        </MenuItem>
                      </Menu>
                    </Box>
                  </TableCell>
                  <TableCell 
                    sx={{ fontWeight: 800, color: '#0F172A', cursor: 'pointer' }} 
                    onClick={(e) => {
                      e.preventDefault();
                      handleSort('created');
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Created
                      {sortColumn === 'created' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUpward sx={{ fontSize: 18, color: '#6818A5' }} />
                        ) : (
                          <ArrowDownward sx={{ fontSize: 18, color: '#6818A5' }} />
                        )
                      ) : (
                        <UnfoldMore sx={{ fontSize: 18, color: '#64748B' }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell 
                    sx={{ fontWeight: 800, color: '#0F172A', cursor: 'pointer' }} 
                    onClick={(e) => {
                      e.preventDefault();
                      handleSort('last_run');
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Last Run
                      {sortColumn === 'last_run' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUpward sx={{ fontSize: 18, color: '#6818A5' }} />
                        ) : (
                          <ArrowDownward sx={{ fontSize: 18, color: '#6818A5' }} />
                        )
                      ) : (
                        <UnfoldMore sx={{ fontSize: 18, color: '#64748B' }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentCollections.map((collection) => (
                    <TableRow 
                      key={collection.id} 
                      sx={{ 
                        '&:hover': { backgroundColor: '#F8FAFC' },
                        '&:last-child td, &:last-child th': { border: 0 }
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: '#1E293B', maxWidth: '300px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, flexShrink: 0 }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="#6818A5"/>
                        </svg>
                      </Box>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 600,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '100%'
                            }}
                            title={collection.name}
                          >
                        {collection.name}
                      </Typography>
                    </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <img src={bookmarkIcon} alt="Saved" style={{ width: 16, height: 16 }} />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {collection.search_count} Input{collection.search_count !== 1 ? 's' : ''}
                    </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                        <Chip
                          label={collection.status === 'saved' ? 'Saved' : collection.status === 'submitted' ? 'Submitted' : 'Scheduled'}
                          size="small"
                          variant={collection.status === 'saved' ? 'outlined' : 'filled'}
                          sx={{
                            fontWeight: 600,
                            ...(collection.status === 'saved' ? {
                              borderColor: '#E2E8F0',
                              color: '#1E293B',
                              backgroundColor: 'transparent',
                              '& .MuiChip-label': { color: '#1E293B !important' }
                            } : collection.status === 'submitted' ? {
                              backgroundColor: '#10B981 !important',
                              color: '#FFFFFF',
                              '& .MuiChip-label': { color: '#FFFFFF !important' },
                              '& .MuiChip-root': { backgroundColor: '#10B981 !important' }
                            } : {
                              backgroundColor: '#F59E0B !important',
                              color: '#FFFFFF',
                              '& .MuiChip-label': { color: '#FFFFFF !important' },
                              '& .MuiChip-root': { backgroundColor: '#F59E0B !important' }
                            })
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                        <TimeDisplay timestamp={collection.created_at} format="datetime" />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                        {collection.last_run_at ? (
                          <TimeDisplay timestamp={collection.last_run_at} format="datetime" />
                        ) : (
                    <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                            Never
                    </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                      <ActionButton 
                        onClick={() => handleViewDetails(collection)} 
                        title="Open"
                      >
                        <img src={viewIcon} alt="View" style={{ width: 20, height: 20 }} />
                      </ActionButton>
                      <ActionButton 
                        onClick={() => handleEditCollection(collection)} 
                        title="Edit"
                      >
                        <img src={editIcon} alt="Edit" style={{ width: 20, height: 20 }} />
                      </ActionButton>
                      <ActionButton 
                        onClick={() => handleSubmitCollection(collection.id)} 
                        disabled={submitting === collection.id}
                        title="Execute"
                      >
                        {submitting === collection.id ? <CircularProgress size={16} /> : <img src={playCircleIcon} alt="Play" style={{ width: 20, height: 20 }} />}
                      </ActionButton>
                      <ActionButton 
                        onClick={() => handleScheduleCollection(collection)} 
                        title="Schedule"
                      >
                        <img src={scheduleIcon} alt="Schedule" style={{ width: 20, height: 20 }} />
                      </ActionButton>
                      <ActionButton 
                        onClick={() => handleDeleteCollection(collection.id)} 
                        disabled={deleting === collection.id}
                        title="Delete"
                      >
                        {deleting === collection.id ? <CircularProgress size={16} /> : <img src={deleteIcon} alt="Delete" style={{ width: 20, height: 20 }} />}
                      </ActionButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {filteredCollections.length > itemsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Stack spacing={2}>
            <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" size="large" showFirstButton showLastButton sx={{ '& .MuiPaginationItem-root': { fontSize: '1rem', fontWeight: 500 }, '& .Mui-selected': { backgroundColor: '#6818A5', color: 'white', '&:hover': { backgroundColor: '#5a1594' } } }} />
            <Typography variant="body2" sx={{ textAlign: 'center', color: '#1E293B', fontWeight: 600 }}>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredCollections.length)} of {filteredCollections.length} collections
            </Typography>
          </Stack>
        </Box>
      )}

      {/* Collection Details Dialog */}
      <Dialog
        open={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 1 }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="#6818A5"/>
                  </svg>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontFamily: '"Urbanist", sans-serif' }}>
                  {selectedCollection?.name}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#1E293B', mb: 0.5, fontWeight: 600 }}>
                Collection with {selectedCollection?.search_count} job{selectedCollection?.search_count !== 1 ? 's' : ''}
              </Typography>
              <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                Created <TimeDisplay timestamp={selectedCollection?.created_at || ''} format="datetime" />
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<img src={bookmarkIcon} alt="Saved" style={{ width: 16, height: 16 }} />}
                sx={{
                  borderColor: '#6818A5',
                  color: '#6818A5',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#5a1594',
                    backgroundColor: '#F7F4FD'
                  }
                }}
              >
                Saved
              </Button>
              <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                {selectedCollection?.search_count} Search{selectedCollection?.search_count !== 1 ? 'es' : ''}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedCollection && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 800, color: '#0F172A', fontFamily: '"Urbanist", sans-serif' }}>
                Searches ({selectedCollection.search_count})
              </Typography>

              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Location</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Dates</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Adults</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Star Rating</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Websites</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedCollection.searches.map((search, index) => (
                      <TableRow key={search.id}>
                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>{index + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>{search.location}</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                          {format(new Date(search.check_in_date), 'MMM dd')} - {format(new Date(search.check_out_date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>{search.adults}</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                          <StarRatingDisplay rating={search.star_rating} />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {search.website && (
                              <Chip
                                label={`${search.website}${search.pos && search.pos.length ? ` (${search.pos.join(', ')})` : ''}`}
                                size="small"
                                variant="outlined"
                                sx={{ 
                                  fontSize: '0.7rem',
                                  borderColor: '#E2E8F0',
                                  color: '#1E293B',
                                  fontWeight: 600
                                }}
                              />
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setShowDetailsDialog(false)} 
            sx={{ 
              backgroundColor: '#6818A5', 
              color: '#ffffff', 
              borderRadius: 2,
              '&:hover': { backgroundColor: '#5a1594' },
              fontFamily: '"Urbanist", sans-serif'
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Collection Dialog */}
      <Dialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 1 }
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }}>
                  <img src={editIcon} alt="Edit" style={{ width: 20, height: 20 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontFamily: '"Urbanist", sans-serif' }}>
                  Edit Collection: {editingCollectionName || editingCollection?.name}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<img src={bookmarkIcon} alt="Saved" style={{ width: 16, height: 16 }} />}
                sx={{
                  borderColor: '#6818A5',
                  color: '#6818A5',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#5a1594',
                    backgroundColor: '#F7F4FD'
                  }
                }}
              >
                Saved
              </Button>
              <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                Collection with {editingCollection?.search_count} job{editingCollection?.search_count !== 1 ? 's' : ''}
              </Typography>
              <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 600 }}>
                Created <TimeDisplay timestamp={editingCollection?.created_at || ''} format="datetime" />
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {editingCollection && (
            <Box>
              {/* Collection Name Editing */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700, color: '#0F172A', fontFamily: '"Urbanist", sans-serif' }}>
                  Collection Name
                </Typography>
                <TextField
                  fullWidth
                  value={editingCollectionName}
                  onChange={(e) => setEditingCollectionName(e.target.value)}
                  placeholder="Enter collection name..."
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6818A5',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6818A5',
                        borderWidth: 2,
                      },
                    },
                  }}
                />
              </Box>

              {/* Tabs for View Items / Add Items - Compact Card Style */}
              <Box sx={{ mb: 2.5 }}>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
                  gap: 1.5
                }}>
                  {/* View Items Tab Card */}
                  <Paper
                    onClick={() => setEditDialogTab(0)}
                    sx={{
                      p: 1.5,
                      cursor: 'pointer',
                      border: editDialogTab === 0 ? '2px solid #6818A5' : '1px solid #E2E8F0',
                      borderRadius: 1.5,
                      backgroundColor: editDialogTab === 0 ? '#F7F4FD' : '#FFFFFF',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#6818A5',
                        backgroundColor: '#F7F4FD',
                        boxShadow: '0 2px 8px rgba(104, 24, 165, 0.1)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1.5,
                          backgroundColor: editDialogTab === 0 ? '#6818A5' : '#F7F4FD',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <VisibilityIcon 
                          sx={{ 
                            fontSize: 18, 
                            color: editDialogTab === 0 ? '#FFFFFF' : '#6818A5',
                            transition: 'color 0.2s ease',
                          }} 
                        />
                      </Box>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 700, 
                          color: '#0F172A',
                          fontFamily: '"Urbanist", sans-serif',
                        }}
                      >
                        View Items
                      </Typography>
                    </Box>
                  </Paper>

                  {/* Add Items Tab Card */}
                  <Paper
                    onClick={() => setEditDialogTab(1)}
                    sx={{
                      p: 1.5,
                      cursor: 'pointer',
                      border: editDialogTab === 1 ? '2px solid #6818A5' : '1px solid #E2E8F0',
                      borderRadius: 1.5,
                      backgroundColor: editDialogTab === 1 ? '#F7F4FD' : '#FFFFFF',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#6818A5',
                        backgroundColor: '#F7F4FD',
                        boxShadow: '0 2px 8px rgba(104, 24, 165, 0.1)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1.5,
                          backgroundColor: editDialogTab === 1 ? '#6818A5' : '#F7F4FD',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <AddIcon 
                          sx={{ 
                            fontSize: 18, 
                            color: editDialogTab === 1 ? '#FFFFFF' : '#6818A5',
                            transition: 'color 0.2s ease',
                          }} 
                        />
                      </Box>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 700, 
                          color: '#0F172A',
                          fontFamily: '"Urbanist", sans-serif',
                        }}
                      >
                        Add Items
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </Box>

              {/* Tab Panel 0: View Items */}
              {editDialogTab === 0 && (
                <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 800, color: '#0F172A', fontFamily: '"Urbanist", sans-serif' }}>
                Searches ({editingCollection.search_count})
              </Typography>

              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A', width: '60px' }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Location</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A', width: '120px' }}>Dates</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A', width: '80px' }}>Adults</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A', width: '100px' }}>Star Rating</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Websites</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#0F172A', width: '80px' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {editingCollection.searches.map((search, index) => (
                      <TableRow key={search.id} sx={{ '&:hover': { backgroundColor: '#F8FAFC' } }}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {search.location}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                            {search.check_in_date} to {search.check_out_date}
                          </Typography>
                        </TableCell>
                        <TableCell>{search.adults}</TableCell>
                        <TableCell>
                          <StarRatingDisplay rating={search.star_rating} />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {search.website && (
                              <Chip
                                label={`${search.website}${search.pos && search.pos.length ? ` (${search.pos.join(', ')})` : ''}`}
                                size="small"
                                sx={{ 
                                  fontSize: '0.7rem', 
                                  height: '20px',
                                  borderColor: '#E2E8F0',
                                  color: '#1E293B',
                                  fontWeight: 600
                                }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <ActionButton 
                            onClick={() => handleEditCollectionItem(search)}
                            title="Edit Item"
                          >
                            <img src={editIcon} alt="Edit" style={{ width: 18, height: 18 }} />
                          </ActionButton>
                            <ActionButton 
                              onClick={() => handleDeleteCollectionItem(search)}
                              title="Delete Item"
                            >
                              <img src={deleteIcon} alt="Delete" style={{ width: 18, height: 18 }} />
                            </ActionButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Alert severity="info" sx={{ mt: 2, borderRadius: 2, backgroundColor: '#F7F4FD' }}>
                <Typography variant="body2" sx={{ fontFamily: '"Urbanist", sans-serif' }}>
                  <strong>Note:</strong> You can edit any search item in this collection. Click "Edit" on any item to modify its parameters.
                </Typography>
              </Alert>
            </Box>
          )}

              {/* Tab Panel 1: Add Items */}
              {editDialogTab === 1 && (
                <Box>
                  {/* Sub-tabs for Manual / CSV Upload - Line Divider Style */}
                  <Box sx={{ mb: 2.5 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      borderBottom: '2px solid #E2E8F0',
                      gap: 0
                    }}>
                      {/* Manual Tab */}
                      <Box
                        onClick={() => setAddItemsTab(0)}
            sx={{ 
                          flex: 1,
                          px: 2,
                          py: 1.5,
                          cursor: 'pointer',
                          borderBottom: addItemsTab === 0 ? '3px solid #6818A5' : '3px solid transparent',
                          backgroundColor: addItemsTab === 0 ? '#F7F4FD' : 'transparent',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1,
              '&:hover': { 
                            backgroundColor: addItemsTab === 0 ? '#F7F4FD' : '#F8FAFC',
                            borderBottomColor: addItemsTab === 0 ? '#6818A5' : '#CBD5E1',
                          },
                        }}
                      >
                        <AddIcon 
            sx={{ 
                            fontSize: 18, 
                            color: addItemsTab === 0 ? '#6818A5' : '#64748B',
                            transition: 'color 0.2s ease',
                          }} 
                        />
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: addItemsTab === 0 ? 700 : 600, 
                            color: addItemsTab === 0 ? '#6818A5' : '#64748B',
                            fontFamily: '"Urbanist", sans-serif',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          Manual
                        </Typography>
                      </Box>

                      {/* Divider Line */}
                      <Box
                        sx={{
                          width: '1px',
                          backgroundColor: '#E2E8F0',
                          my: 1
                        }}
                      />

                      {/* CSV Upload Tab */}
                      <Box
                        onClick={() => setAddItemsTab(1)}
                        sx={{
                          flex: 1,
                          px: 2,
                          py: 1.5,
                          cursor: 'pointer',
                          borderBottom: addItemsTab === 1 ? '3px solid #6818A5' : '3px solid transparent',
                          backgroundColor: addItemsTab === 1 ? '#F7F4FD' : 'transparent',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1,
                          '&:hover': {
                            backgroundColor: addItemsTab === 1 ? '#F7F4FD' : '#F8FAFC',
                            borderBottomColor: addItemsTab === 1 ? '#6818A5' : '#CBD5E1',
                          },
                        }}
                      >
                        <FileUploadIcon 
                          sx={{ 
                            fontSize: 18, 
                            color: addItemsTab === 1 ? '#6818A5' : '#64748B',
                            transition: 'color 0.2s ease',
                          }} 
                        />
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: addItemsTab === 1 ? 700 : 600, 
                            color: addItemsTab === 1 ? '#6818A5' : '#64748B',
                            fontFamily: '"Urbanist", sans-serif',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          CSV Upload
            </Typography>
          </Box>
                    </Box>
                  </Box>

                  {/* Manual Add Tab */}
                  {addItemsTab === 0 && (
                    <Paper sx={{ p: 3, backgroundColor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 800, color: '#0F172A', fontFamily: '"Urbanist", sans-serif' }}>
                        Add New Search Item
                    </Typography>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        {/* Website and POS */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: '#0F172A' }}>Website</Typography>
                            <FormControl fullWidth size="small">
                              <Select
                                value={newItemForm.selectedWebsite?.name || ''}
                                onChange={(e) => {
                                  const siteName = e.target.value;
                                  setNewItemForm({
                                    ...newItemForm,
                                    selectedWebsite: siteName ? { name: siteName } : null,
                                    selectedPOS: []
                                  });
                                }}
                                displayEmpty
            sx={{ 
              borderRadius: 2,
                                  backgroundColor: '#FFFFFF',
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#E2E8F0'
                                  },
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#6818A5'
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#6818A5',
                                    borderWidth: 2
                                  },
                                  '& .MuiSelect-select': {
                                    '&:hover': {
                                      backgroundColor: 'rgba(104, 24, 165, 0.04)'
                                    }
                                  }
                                }}
                              >
                                <MenuItem value="" disabled>Select website</MenuItem>
                                {sites.map((site) => (
                                  <MenuItem 
                                    key={site.code} 
                                    value={site.name}
                                    sx={{
                                      '&:hover': {
                                        backgroundColor: 'rgba(104, 24, 165, 0.08)',
                                        color: '#6818A5'
                                      },
                                      '&.Mui-selected': {
                                        backgroundColor: 'rgba(104, 24, 165, 0.12)',
                                        color: '#6818A5',
                                        '&:hover': {
                                          backgroundColor: 'rgba(104, 24, 165, 0.16)'
                                        }
                                      }
                                    }}
                                  >
                                    {site.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: '#0F172A' }}>POS (Optional)</Typography>
                            <FormControl fullWidth size="small">
                              <Select
                                multiple
                                value={newItemForm.selectedPOS}
                                onChange={(e) => setNewItemForm({ ...newItemForm, selectedPOS: e.target.value as string[] })}
                                disabled={!newItemForm.selectedWebsite || posOptions.length === 0}
                                renderValue={(selected) => (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {(selected as string[]).map((pos) => (
                                      <Chip 
                                        key={pos} 
                                        label={pos} 
                                        size="small"
                                        sx={{
                                          backgroundColor: '#F7F4FD',
                                          color: '#6818A5',
                                          fontWeight: 600,
                                          '&:hover': {
                                            backgroundColor: '#F0E8FF'
                                          }
                                        }}
                                      />
                                    ))}
                                  </Box>
                                )}
                                sx={{
                                  borderRadius: 2,
                                  backgroundColor: '#FFFFFF',
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#E2E8F0'
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
                                {posOptions.map((pos) => (
                                  <MenuItem 
                                    key={pos} 
                                    value={pos}
                                    sx={{
                                      '&:hover': {
                                        backgroundColor: 'rgba(104, 24, 165, 0.08)',
                                        color: '#6818A5'
                                      },
                                      '&.Mui-selected': {
                                        backgroundColor: 'rgba(104, 24, 165, 0.12)',
                                        color: '#6818A5',
                                        '&:hover': {
                                          backgroundColor: 'rgba(104, 24, 165, 0.16)'
                                        }
                                      }
                                    }}
                                  >
                                    {pos}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Box>
                        </Box>

                        {/* Location */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: '#0F172A' }}>City</Typography>
                        <TextField
                          fullWidth
                          size="small"
                              value={newItemForm.city}
                              onChange={(e) => setNewItemForm({ ...newItemForm, city: e.target.value })}
                              placeholder="Enter city name"
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                                  backgroundColor: '#FFFFFF',
                                  '& fieldset': {
                                    borderColor: '#E2E8F0'
                                  },
                                  '&:hover fieldset': {
                                    borderColor: '#6818A5'
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#6818A5',
                                    borderWidth: 2
                                  }
                                }
                          }}
                        />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: '#0F172A' }}>Country Code</Typography>
                            <FormControl fullWidth size="small">
                              <Select
                                value={newItemForm.countryCode}
                                onChange={(e) => setNewItemForm({ ...newItemForm, countryCode: e.target.value })}
                                displayEmpty
                                sx={{
                                  borderRadius: 2,
                                  backgroundColor: '#FFFFFF',
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#E2E8F0'
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
                                <MenuItem value="" disabled>Select country</MenuItem>
                                {countryCodes.map((code) => (
                                  <MenuItem 
                                    key={code} 
                                    value={code}
                                    sx={{
                                      '&:hover': {
                                        backgroundColor: 'rgba(104, 24, 165, 0.08)',
                                        color: '#6818A5'
                                      },
                                      '&.Mui-selected': {
                                        backgroundColor: 'rgba(104, 24, 165, 0.12)',
                                        color: '#6818A5',
                                        '&:hover': {
                                          backgroundColor: 'rgba(104, 24, 165, 0.16)'
                                        }
                                      }
                                    }}
                                  >
                                    {code}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Box>
                  </Box>

                        {/* Dates */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: '#0F172A' }}>Check-in Date</Typography>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                                value={newItemForm.checkInDate}
                                onChange={(date) => setNewItemForm({ ...newItemForm, checkInDate: date })}
                                minDate={startOfToday()}
                        slotProps={{
                          textField: { 
                            fullWidth: true,
                            size: 'small',
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                        backgroundColor: '#FFFFFF',
                                        '& fieldset': {
                                          borderColor: '#E2E8F0'
                                        },
                                        '&:hover fieldset': {
                                          borderColor: '#6818A5'
                                        },
                                        '&.Mui-focused fieldset': {
                                          borderColor: '#6818A5',
                                          borderWidth: 2
                                        }
                                      }
                            }
                          }
                        }}
                      />
                    </LocalizationProvider>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: '#0F172A' }}>Check-out Date</Typography>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                              <DatePicker
                                value={newItemForm.checkOutDate}
                                onChange={(date) => setNewItemForm({ ...newItemForm, checkOutDate: date })}
                                minDate={newItemForm.checkInDate || startOfToday()}
                                slotProps={{ 
                                  textField: { 
                                    fullWidth: true, 
                                    size: 'small',
                                    sx: {
                                      '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        backgroundColor: '#FFFFFF',
                                        '& fieldset': {
                                          borderColor: '#E2E8F0'
                                        },
                                        '&:hover fieldset': {
                                          borderColor: '#6818A5'
                                        },
                                        '&.Mui-focused fieldset': {
                                          borderColor: '#6818A5',
                                          borderWidth: 2
                                        }
                                      }
                                    }
                                  } 
                                }}
                              />
                            </LocalizationProvider>
                          </Box>
                  </Box>

                        {/* Adults and Star Rating */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: '#0F172A' }}>Adults</Typography>
                    <FormControl fullWidth size="small">
                      <Select
                                value={newItemForm.adults}
                                onChange={(e) => setNewItemForm({ ...newItemForm, adults: Number(e.target.value) })}
                        sx={{
                          borderRadius: 2,
                                  backgroundColor: '#FFFFFF',
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#E2E8F0'
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
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                                  <MenuItem 
                                    key={num} 
                                    value={num}
                                    sx={{
                                      '&:hover': {
                                        backgroundColor: 'rgba(104, 24, 165, 0.08)',
                                        color: '#6818A5'
                                      },
                                      '&.Mui-selected': {
                                        backgroundColor: 'rgba(104, 24, 165, 0.12)',
                                        color: '#6818A5',
                                        '&:hover': {
                                          backgroundColor: 'rgba(104, 24, 165, 0.16)'
                                        }
                                      }
                                    }}
                                  >
                                    {num}
                                  </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: '#0F172A' }}>Star Rating</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <FormControl fullWidth size="small">
                                <Select
                                  value={newItemForm.starRating}
                                  onChange={(e) => setNewItemForm({ ...newItemForm, starRating: Number(e.target.value) })}
                                  sx={{
                                    borderRadius: 2,
                                    backgroundColor: '#FFFFFF',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                      borderColor: '#E2E8F0'
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
                                  {[1, 2, 3, 4, 5].map((stars) => (
                                    <MenuItem 
                                      key={stars} 
                                      value={stars}
                                      sx={{
                                        '&:hover': {
                                          backgroundColor: 'rgba(104, 24, 165, 0.08)',
                                          color: '#6818A5'
                                        },
                                        '&.Mui-selected': {
                                          backgroundColor: 'rgba(104, 24, 165, 0.12)',
                                          color: '#6818A5',
                                          '&:hover': {
                                            backgroundColor: 'rgba(104, 24, 165, 0.16)'
                                          }
                                        }
                                      }}
                                    >
                                      {stars}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={newItemForm.starRatingOrMore}
                                    onChange={(e) => setNewItemForm({ ...newItemForm, starRatingOrMore: e.target.checked })}
                                    sx={{
                                      color: '#6818A5',
                                      '&.Mui-checked': {
                                        color: '#6818A5'
                                      },
                                      '&:hover': {
                                        backgroundColor: 'rgba(104, 24, 165, 0.04)'
                                      }
                                    }}
                                  />
                                }
                                label="or more"
                                sx={{
                                  '& .MuiFormControlLabel-label': {
                                    fontWeight: 600,
                                    color: '#1E293B'
                                  }
                                }}
                              />
                            </Box>
                          </Box>
                  </Box>

                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={handleAddNewItem}
                          disabled={!validateNewItem()}
                          sx={{ 
                            backgroundColor: '#6818A5', 
                            borderRadius: 2,
                            py: 1.5,
                            fontWeight: 600,
                            textTransform: 'none',
                            boxShadow: '0 2px 8px rgba(104, 24, 165, 0.3)',
                            '&:hover': { 
                              backgroundColor: '#5a1594',
                              boxShadow: '0 4px 12px rgba(104, 24, 165, 0.4)',
                              transform: 'translateY(-1px)'
                            },
                            '&:disabled': {
                              backgroundColor: '#94A3B8',
                              boxShadow: 'none'
                            },
                            transition: 'all 0.2s ease-in-out'
                          }}
                        >
                          Add Item
                        </Button>
                      </Box>

                      {/* Preview of new items */}
                      {newItems.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="h6" sx={{ mb: 2, fontWeight: 800, color: '#0F172A', fontFamily: '"Urbanist", sans-serif' }}>
                            Items to Add ({newItems.length})
                    </Typography>
                          <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow sx={{ backgroundColor: '#F7F4FD' }}>
                                  <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Location</TableCell>
                                  <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Dates</TableCell>
                                  <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Adults</TableCell>
                                  <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Star Rating</TableCell>
                                  <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Website</TableCell>
                                  <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Actions</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {newItems.map((item, index) => (
                                  <TableRow 
                                    key={index}
                                    sx={{
                                      '&:hover': {
                                        backgroundColor: 'rgba(104, 24, 165, 0.04)'
                                      },
                                      '&:last-child td': {
                                        borderBottom: 'none'
                                      }
                                    }}
                                  >
                                    <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>{item.location}</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>{item.check_in_date} to {item.check_out_date}</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>{item.adults}</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                                      <StarRatingDisplay rating={item.star_rating} />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                                      {item.website}{item.pos?.length ? ` (${item.pos.join(', ')})` : ''}
                                    </TableCell>
                                    <TableCell>
                                      <IconButton 
                          size="small"
                                        onClick={() => handleRemoveNewItem(index)}
                                        sx={{
                                          color: '#EF4444',
                                          '&:hover': {
                                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                            color: '#DC2626'
                                          }
                                        }}
                                      >
                                        <img src={deleteIcon} alt="Delete" style={{ width: 18, height: 18 }} />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      )}
                    </Paper>
                  )}

                  {/* CSV Upload Tab */}
                  {addItemsTab === 1 && (
                    <Paper sx={{ p: 3, backgroundColor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 800, color: '#0F172A', fontFamily: '"Urbanist", sans-serif' }}>
                        Upload CSV File
                      </Typography>
                      <Alert 
                        severity="info" 
                        sx={{ 
                          mb: 3,
                          borderRadius: 2,
                          backgroundColor: '#EFF6FF',
                          border: '1px solid #BFDBFE',
                          '& .MuiAlert-icon': {
                            color: '#3B82F6'
                          },
                          '& .MuiAlert-message': {
                            color: '#1E40AF',
                            fontWeight: 600
                          }
                        }}
                      >
                        CSV format: Site, City, Country, CheckIn (YYYYMMDD), CheckOut (YYYYMMDD), StarRating, Adults [, POS]
                      </Alert>
                      <input
                        accept=".csv"
                        style={{ display: 'none' }}
                        id="csv-upload-edit"
                        type="file"
                        onChange={handleCSVUpload}
                      />
                      <label htmlFor="csv-upload-edit">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<CloudUploadIcon />}
                          sx={{
                            borderColor: '#6818A5',
                            color: '#6818A5',
                            borderRadius: 2,
                            py: 1.5,
                            px: 3,
                            fontWeight: 600,
                            textTransform: 'none',
                            backgroundColor: '#FFFFFF',
                            boxShadow: '0 2px 4px rgba(104, 24, 165, 0.1)',
                            '&:hover': { 
                              borderColor: '#5a1594',
                              backgroundColor: '#F7F4FD',
                              boxShadow: '0 4px 8px rgba(104, 24, 165, 0.2)',
                              transform: 'translateY(-1px)'
                            },
                            transition: 'all 0.2s ease-in-out'
                          }}
                        >
                          Upload CSV File
                        </Button>
                      </label>

                      {/* Preview of new items from CSV */}
                      {newItems.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                          <Typography variant="h6" sx={{ mb: 2, fontWeight: 800, color: '#0F172A', fontFamily: '"Urbanist", sans-serif' }}>
                            Items to Add ({newItems.length})
                          </Typography>
                          <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                            <Table size="small">
                              <TableHead>
                                <TableRow sx={{ backgroundColor: '#F7F4FD' }}>
                                  <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Location</TableCell>
                                  <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Dates</TableCell>
                                  <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Adults</TableCell>
                                  <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Star Rating</TableCell>
                                  <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Website</TableCell>
                                  <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Actions</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {newItems.map((item, index) => (
                                  <TableRow 
                                    key={index}
                                    sx={{
                                      '&:hover': {
                                        backgroundColor: 'rgba(104, 24, 165, 0.04)'
                                      },
                                      '&:last-child td': {
                                        borderBottom: 'none'
                                      }
                                    }}
                                  >
                                    <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>{item.location}</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>{item.check_in_date} to {item.check_out_date}</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>{item.adults}</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                                      <StarRatingDisplay rating={item.star_rating} />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                                      {item.website}{item.pos?.length ? ` (${item.pos.join(', ')})` : ''}
                                    </TableCell>
                                    <TableCell>
                                      <IconButton 
                                        size="small" 
                                        onClick={() => handleRemoveNewItem(index)}
                                        sx={{
                                          color: '#EF4444',
                                          '&:hover': {
                                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                            color: '#DC2626'
                                          }
                                        }}
                                      >
                                        <img src={deleteIcon} alt="Delete" style={{ width: 18, height: 18 }} />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                      ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                    </Box>
                      )}
                    </Paper>
                  )}

                  {/* Add Items Button */}
                  {newItems.length > 0 && (
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        onClick={handleAddItemsToCollection}
                        disabled={addingItems}
                        sx={{ 
                          backgroundColor: '#6818A5',
                          borderRadius: 2,
                          py: 1.5,
                          px: 4,
                          fontWeight: 600,
                          textTransform: 'none',
                          boxShadow: '0 2px 8px rgba(104, 24, 165, 0.3)',
                          '&:hover': { 
                            backgroundColor: '#5a1594',
                            boxShadow: '0 4px 12px rgba(104, 24, 165, 0.4)',
                            transform: 'translateY(-1px)'
                          },
                          '&:disabled': {
                            backgroundColor: '#94A3B8',
                            boxShadow: 'none'
                          },
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        {addingItems ? 'Adding...' : `Add ${newItems.length} Item(s) to Collection`}
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={handleCancelEdit}
            variant="contained"
            sx={{ 
              backgroundColor: '#6818A5',
              borderRadius: 2,
              '&:hover': { backgroundColor: '#5a1594' },
              fontFamily: '"Urbanist", sans-serif'
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Collection Item Dialog */}
      <Dialog
        open={showEditItemDialog}
        onClose={() => setShowEditItemDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }
        }}
      >
        <DialogTitle sx={{ pb: 2, borderBottom: '1px solid #E2E8F0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ 
              width: 40, 
              height: 40, 
              borderRadius: 2, 
              backgroundColor: '#F7F4FD', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
            <img src={editIcon} alt="Edit" style={{ width: 20, height: 20 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontFamily: '"Urbanist", sans-serif' }}>
              Edit Collection Item
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, backgroundColor: '#FFFFFF' }}>
          {editingItem && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Website and POS Selection - Same Level */}
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700, color: '#0F172A' }}>
                      Select Hotel Website
                    </Typography>
                    <FormControl fullWidth>
                      <Select
                        value={editFormData.selectedWebsites.length > 0 ? editFormData.selectedWebsites[0].code : ''}
                        onChange={(e) => {
                          const siteCode = e.target.value;
                          const website = sites.find(w => w.code === siteCode);
                          if (website) {
                            setEditFormData({
                              ...editFormData,
                              selectedWebsites: [website],
                              posMapping: { [website.code]: editFormData.posMapping[website.code] || [] }
                            });
                            // Fetch POS options for the selected website
                            axios.get('http://localhost:5001/pos', { params: { site_name: website.name } })
                              .then(res => setEditItemPosOptions(res.data.pos || []))
                              .catch(() => setEditItemPosOptions([]));
                          } else {
                            setEditFormData({
                              ...editFormData,
                              selectedWebsites: [],
                              posMapping: {}
                            });
                            setEditItemPosOptions([]);
                          }
                        }}
                        displayEmpty
                        disabled={sites.length === 0}
                        sx={{
                          '& .MuiOutlinedInput-root': { height: '48px' },
                          borderRadius: 2,
                          backgroundColor: '#FFFFFF',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#E2E8F0'
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
                        <MenuItem value="" disabled>
                          {sites.length === 0 ? 'No sites available' : 'Select a website'}
                        </MenuItem>
                        {sites.map((website) => (
                          <MenuItem 
                            key={website.code} 
                            value={website.code}
                            sx={{
                              '&:hover': {
                                backgroundColor: 'rgba(104, 24, 165, 0.08)',
                                color: '#6818A5'
                              },
                              '&.Mui-selected': {
                                backgroundColor: 'rgba(104, 24, 165, 0.12)',
                                color: '#6818A5',
                                '&:hover': {
                                  backgroundColor: 'rgba(104, 24, 165, 0.16)'
                                }
                              }
                            }}
                          >
                            {website.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700, color: '#0F172A' }}>
                      Select POS (Optional)
                    </Typography>
                    <FormControl fullWidth>
                      <Select
                        multiple
                        value={editFormData.selectedWebsites.length > 0 ? (editFormData.posMapping[editFormData.selectedWebsites[0].code] || []) : []}
                        onChange={(e) => {
                          if (editFormData.selectedWebsites.length > 0) {
                            const websiteCode = editFormData.selectedWebsites[0].code;
                            setEditFormData({
                              ...editFormData,
                              posMapping: { ...editFormData.posMapping, [websiteCode]: e.target.value as string[] }
                            });
                          }
                        }}
                        displayEmpty
                        disabled={editFormData.selectedWebsites.length === 0}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { height: '48px' },
                                borderRadius: 2,
                          backgroundColor: '#FFFFFF',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#E2E8F0'
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#6818A5'
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#6818A5',
                            borderWidth: 2
                          }
                        }}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(selected as string[]).map((pos) => (
                              <Chip 
                                key={pos} 
                                label={pos} 
                                size="small"
                                sx={{
                                  backgroundColor: '#F7F4FD',
                                  color: '#6818A5',
                                  fontWeight: 600,
                                  '&:hover': {
                                    backgroundColor: '#F0E8FF'
                          }
                        }}
                      />
                            ))}
                  </Box>
                        )}
                      >
                        <MenuItem value="" disabled>
                          {editFormData.selectedWebsites.length === 0 ? 'Select website first' : (editItemPosOptions.length === 0 ? 'No POS available' : 'Select POS')}
                        </MenuItem>
                        {editItemPosOptions.map((pos) => (
                          <MenuItem 
                            key={pos} 
                            value={pos}
                        sx={{
                              '&:hover': {
                                backgroundColor: 'rgba(104, 24, 165, 0.08)',
                                color: '#6818A5'
                              },
                              '&.Mui-selected': {
                                backgroundColor: 'rgba(104, 24, 165, 0.12)',
                                color: '#6818A5',
                                '&:hover': {
                                  backgroundColor: 'rgba(104, 24, 165, 0.16)'
                                }
                              }
                            }}
                          >
                            {pos}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                {/* Location */}
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700, color: '#0F172A' }}>
                      City Name
                    </Typography>
                    <TextField
                      value={(() => {
                        // Extract city name from location (before comma)
                        const parts = editFormData.location.split(', ');
                        return parts[0] || editFormData.location;
                      })()}
                      onChange={(e) => {
                        const city = e.target.value;
                        const countryCode = editFormData.location.split(', ').length > 1 
                          ? editFormData.location.split(', ')[editFormData.location.split(', ').length - 1]
                          : '';
                            setEditFormData({
                              ...editFormData,
                          location: countryCode ? `${city}, ${countryCode}` : city 
                        });
                        if (city) fetchSites();
                      }}
                      placeholder="Enter city name"
                      fullWidth
                      sx={{ 
                        '& .MuiOutlinedInput-root': { height: '48px' },
                        borderRadius: 2,
                        backgroundColor: '#FFFFFF',
                        '& fieldset': {
                          borderColor: '#E2E8F0'
                        },
                        '&:hover fieldset': {
                          borderColor: '#6818A5'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#6818A5',
                          borderWidth: 2
                        },
                        '& input::placeholder': {
                          color: '#CBD5E1',
                          fontWeight: 350,
                          opacity: 1
                        }
                      }}
                        />
                    </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700, color: '#0F172A' }}>
                      Country Code
                    </Typography>
                    <FormControl fullWidth>
                      <Select
                        value={(() => {
                          // Extract country code from location if it exists
                          const parts = editFormData.location.split(', ');
                          return parts.length > 1 ? parts[parts.length - 1] : '';
                        })()}
                        onChange={(e) => {
                          const countryCode = e.target.value;
                          const city = editFormData.location.split(', ')[0] || editFormData.location;
                          setEditFormData({ ...editFormData, location: `${city}, ${countryCode}` });
                        }}
                        displayEmpty
                        sx={{
                          height: '48px',
                          borderRadius: 2,
                          backgroundColor: '#FFFFFF',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#E2E8F0'
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
                        <MenuItem value="" disabled>
                          Select country
                        </MenuItem>
                        {countryCodes.map((code) => (
                          <MenuItem 
                            key={code} 
                            value={code}
                            sx={{
                              '&:hover': {
                                backgroundColor: 'rgba(104, 24, 165, 0.08)',
                                color: '#6818A5'
                              },
                              '&.Mui-selected': {
                                backgroundColor: 'rgba(104, 24, 165, 0.12)',
                                color: '#6818A5',
                                '&:hover': {
                                  backgroundColor: 'rgba(104, 24, 165, 0.16)'
                                }
                              }
                            }}
                          >
                            {code}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                {/* Dates */}
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700, color: '#0F172A' }}>
                      Check-in Date
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        value={editFormData.checkInDate}
                        onChange={(newValue) => setEditFormData({ ...editFormData, checkInDate: newValue })}
                        minDate={startOfToday()}
                        slotProps={{
                          textField: { 
                            fullWidth: true, 
                            sx: { 
                              '& .MuiOutlinedInput-root': { height: '48px' },
                              borderRadius: 2,
                              backgroundColor: '#FFFFFF',
                              '& fieldset': {
                                borderColor: '#E2E8F0'
                              },
                              '&:hover fieldset': {
                                borderColor: '#6818A5'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#6818A5',
                                borderWidth: 2
                              },
                              '& input::placeholder': {
                                color: '#94A3B8',
                                fontWeight: 500,
                                opacity: 1
                              }
                            } 
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700, color: '#0F172A' }}>
                      Check-out Date
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        value={editFormData.checkOutDate}
                        onChange={(newValue) => setEditFormData({ ...editFormData, checkOutDate: newValue })}
                        minDate={editFormData.checkInDate || startOfToday()}
                        slotProps={{
                          textField: { 
                            fullWidth: true,
                            sx: {
                              '& .MuiOutlinedInput-root': { height: '48px' },
                                borderRadius: 2,
                              backgroundColor: '#FFFFFF',
                              '& fieldset': {
                                borderColor: '#E2E8F0'
                              },
                              '&:hover fieldset': {
                                borderColor: '#6818A5'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#6818A5',
                                borderWidth: 2
                              },
                              '& input::placeholder': {
                                color: '#94A3B8',
                                fontWeight: 500,
                                opacity: 1
                              }
                            }
                          }
                        }}
                      />
                    </LocalizationProvider>
                  </Box>
                  </Box>

                {/* Adults and Star Rating */}
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700, color: '#0F172A' }}>
                      Number of Adults
                    </Typography>
                    <FormControl fullWidth>
                      <Select
                        value={editFormData.adults}
                        onChange={(e) => setEditFormData({ ...editFormData, adults: Number(e.target.value) })}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { height: '48px' },
                          borderRadius: 2,
                          backgroundColor: '#FFFFFF',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#E2E8F0'
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
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <MenuItem 
                            key={num} 
                            value={num}
                            sx={{
                              '&:hover': {
                                backgroundColor: 'rgba(104, 24, 165, 0.08)',
                                color: '#6818A5'
                              },
                              '&.Mui-selected': {
                                backgroundColor: 'rgba(104, 24, 165, 0.12)',
                                color: '#6818A5',
                                '&:hover': {
                                  backgroundColor: 'rgba(104, 24, 165, 0.16)'
                                }
                              }
                            }}
                          >
                            {num}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700, color: '#0F172A' }}>
                      Star Rating
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <FormControl fullWidth>
                        <Select
                          value={editFormData.starRating}
                          onChange={(e) => setEditFormData({ ...editFormData, starRating: Number(e.target.value) })}
                          sx={{
                            '& .MuiOutlinedInput-root': { height: '48px' },
                            borderRadius: 2,
                            backgroundColor: '#FFFFFF',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#E2E8F0'
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
                          {[1, 2, 3, 4, 5].map((stars) => (
                            <MenuItem 
                              key={stars} 
                              value={stars}
                              sx={{
                                '&:hover': {
                                  backgroundColor: 'rgba(104, 24, 165, 0.08)',
                                  color: '#6818A5'
                                },
                                '&.Mui-selected': {
                                  backgroundColor: 'rgba(104, 24, 165, 0.12)',
                                  color: '#6818A5',
                                  '&:hover': {
                                    backgroundColor: 'rgba(104, 24, 165, 0.16)'
                                  }
                                }
                              }}
                            >
                              {stars}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={editFormData.starRatingOrMore}
                            onChange={(e) => setEditFormData({ ...editFormData, starRatingOrMore: e.target.checked })}
                            sx={{
                              color: '#6818A5',
                              '&.Mui-checked': {
                                color: '#6818A5'
                              },
                              '&:hover': {
                                backgroundColor: 'rgba(104, 24, 165, 0.04)'
                              }
                            }}
                          />
                        }
                        label="or more"
                        sx={{
                          '& .MuiFormControlLabel-label': {
                            fontWeight: 600,
                            color: '#1E293B'
                          }
                        }}
                      />
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
          <Button 
            onClick={() => setShowEditItemDialog(false)}
            sx={{
              borderRadius: 2,
              color: '#64748B',
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
              py: 1,
              '&:hover': {
                backgroundColor: '#F1F5F9',
                color: '#475569'
              },
              fontFamily: '"Urbanist", sans-serif',
              transition: 'all 0.2s ease'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateCollectionItem} 
            variant="contained"
            sx={{
              backgroundColor: '#6818A5',
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              px: 4,
              py: 1,
              boxShadow: '0 2px 8px rgba(104, 24, 165, 0.3)',
              '&:hover': { 
                backgroundColor: '#5a1594',
                boxShadow: '0 4px 12px rgba(104, 24, 165, 0.4)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease-in-out',
              fontFamily: '"Urbanist", sans-serif'
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Scheduler Dialog */}
      <ScheduleScheduler
        open={scheduleOpen}
        onClose={() => {
          setScheduleOpen(false);
          setCollectionToSchedule(null);
        }}
        onSchedule={handleScheduleConfirm}
      />
    </Box>
  );
};

export default MyCollections;
