import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Chip,
  FormControlLabel,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import { format, startOfToday } from 'date-fns';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import EditNoteIcon from '@mui/icons-material/EditNote';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ScheduleScheduler from './ScheduleScheduler';
import starIcon from '../../icons/star.svg';
import editIcon from '../../icons/edit.svg';
import deleteIcon from '../../icons/delete.svg';

// Types
interface SiteType {
  name: string;
}

interface SearchItem {
  id: string;
  city: string;
  countryCode: string;
  website: SiteType;
  pos: string[];
  checkInDate: Date | null;
  checkOutDate: Date | null;
  adults: number;
  starRating: number;
  starRatingOrMore: boolean;
}

const MultiSearchForm = () => {
  const { token } = useAuth();
  const [searches, setSearches] = useState<SearchItem[]>([]);
  const [editingSearchId, setEditingSearchId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [collectionName, setCollectionName] = useState<string>('');

  // API base URL - defined at component level for all functions to use
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

  // Dynamic state for sites and POS
  const [sites, setSites] = useState<string[]>([]);
  const [posOptions, setPosOptions] = useState<string[]>([]);

  // Current form state
  const [city, setCity] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('');
  const [selectedWebsite, setSelectedWebsite] = useState<SiteType | null>(null);
  const [selectedPOS, setSelectedPOS] = useState<string[]>([]);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [adults, setAdults] = useState<number>(2);
  const [starRating, setStarRating] = useState<number>(1);
  const [starRatingOrMore, setStarRatingOrMore] = useState<boolean>(false);

  // Schedule dialog
  const [scheduleOpen, setScheduleOpen] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState(0);
  
  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);

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

  // Fetch sites on mount
  useEffect(() => {
    axios.get(`${API_BASE_URL}/sites`)
      .then(res => setSites(res.data.sites || []))
      .catch(() => setSites([]));
  }, []);

  // Fetch POS when selectedWebsite changes
  useEffect(() => {
    if (selectedWebsite) {
      axios.get(`${API_BASE_URL}/pos`, { params: { site_name: selectedWebsite.name } })
        .then(res => setPosOptions(res.data.pos || []))
        .catch(() => setPosOptions([]));
    } else {
      setPosOptions([]);
    }
  }, [selectedWebsite]);

  const handleWebsiteChange = async (event: SelectChangeEvent<string>) => {
    const siteName = event.target.value;
    if (siteName) {
      try {
        const res = await axios.get(`${API_BASE_URL}/pos`, { params: { site_name: siteName } });
        const posList = res.data.pos || [];
        setPosOptions(posList);
        setSelectedWebsite({ name: siteName });
        setSelectedPOS([]); // Reset POS selection when website changes
      } catch {
        setSelectedWebsite({ name: siteName });
        setPosOptions([]);
        setSelectedPOS([]);
      }
    } else {
      setSelectedWebsite(null);
      setPosOptions([]);
      setSelectedPOS([]);
    }
  };

  const handlePOSChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setSelectedPOS(value);
  };

  const resetForm = () => {
    setCity('');
    setCountryCode('');
    setSelectedWebsite(null);
    setSelectedPOS([]);
    setCheckInDate(null);
    setCheckOutDate(null);
    setAdults(2);
    setStarRating(1);
    setStarRatingOrMore(false);
  };

  const validateCurrentSearch = () => {
    return (
      selectedWebsite &&
      city &&
      countryCode &&
      checkInDate &&
      checkOutDate &&
      adults > 0 &&
      starRating > 0
    );
  };

  const isDuplicateSearch = (newSearch: SearchItem) => {
    return searches.some(existingSearch => {
      const sameLocation = `${existingSearch.city}, ${existingSearch.countryCode}` === `${newSearch.city}, ${newSearch.countryCode}`;
      const sameCheckIn = existingSearch.checkInDate?.getTime() === newSearch.checkInDate?.getTime();
      const sameCheckOut = existingSearch.checkOutDate?.getTime() === newSearch.checkOutDate?.getTime();
      const sameAdults = existingSearch.adults === newSearch.adults;
      const sameStarRating = existingSearch.starRating === newSearch.starRating && 
                            existingSearch.starRatingOrMore === newSearch.starRatingOrMore;
      const sameWebsite = existingSearch.website.name === newSearch.website.name;
      const samePOS = JSON.stringify(existingSearch.pos.sort()) === JSON.stringify(newSearch.pos.sort());
      return sameLocation && sameCheckIn && sameCheckOut && sameAdults && sameStarRating && sameWebsite && samePOS;
    });
  };

  const handleAddSearch = () => {
    if (!validateCurrentSearch()) {
      alert('Please fill all required fields before adding a search.');
      return;
    }
    const newSearch: SearchItem = {
      id: Date.now().toString(),
      city,
      countryCode,
      website: selectedWebsite!,
      pos: [...selectedPOS],
      checkInDate,
      checkOutDate,
      adults,
      starRating,
      starRatingOrMore
    };
    if (isDuplicateSearch(newSearch)) {
      alert('This search already exists in your collection. Please modify some parameters to make it unique.');
      return;
    }
    setSearches([...searches, newSearch]);
    resetForm();
  };

  const handleEditSearch = (search: SearchItem) => {
    setEditingSearchId(search.id);
    setCity(search.city);
    setCountryCode(search.countryCode);
    setSelectedWebsite(search.website);
    setSelectedPOS([...search.pos]);
    setCheckInDate(search.checkInDate);
    setCheckOutDate(search.checkOutDate);
    setAdults(search.adults);
    setStarRating(search.starRating);
    setStarRatingOrMore(search.starRatingOrMore);
    // Switch to manual search tab to show the edit form
    setActiveTab(0);
    // Scroll to the form section
    setTimeout(() => {
      const formElement = document.querySelector('[data-form-section]');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleUpdateSearch = () => {
    if (!editingSearchId || !validateCurrentSearch()) {
      alert('Please fill all required fields before updating.');
      return;
    }
    const updatedSearch: SearchItem = {
      id: editingSearchId,
      city,
      countryCode,
      website: selectedWebsite!,
      pos: [...selectedPOS],
      checkInDate,
      checkOutDate,
      adults,
      starRating,
      starRatingOrMore
    };
    setSearches(searches.map(s => s.id === editingSearchId ? updatedSearch : s));
    setEditingSearchId(null);
    resetForm();
  };

  const handleDeleteSearch = (searchId: string) => {
    setSearches(searches.filter(s => s.id !== searchId));
  };

  const handleScheduleConfirm = async (scheduleData: any) => {
    setScheduleOpen(false);
    
    try {
      // First, create a collection with the searches
      const collectionPayload = {
        jobs: searches.map(search => ({
          website: {
            name: search.website.name,
            pos: search.pos
          },
          location: `${search.city}, ${search.countryCode}`,
          checkInDate: search.checkInDate ? format(search.checkInDate, 'yyyy-MM-dd') : '',
          checkOutDate: search.checkOutDate ? format(search.checkOutDate, 'yyyy-MM-dd') : '',
          adults: search.adults,
          starRating: search.starRating.toString()
        }))
      };

      if (!collectionName || collectionName.trim() === '') {
        alert('Please enter a collection name before scheduling.');
        return;
      }
      
      const scheduleCollectionPayload: any = {
        ...collectionPayload,
        action: 'save',
        collection_name: collectionName.trim()
      };
      const collectionRes = await axios.post(`${API_BASE_URL}/save-multi-form`, scheduleCollectionPayload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (collectionRes.status === 200) {
        const collection = collectionRes.data;
        
        // Then create a schedule linked to this collection
        // Format: user-given collection name + date
        const dateStr = new Date().toLocaleDateString();
        const schedulePayload = {
          name: `${collectionName.trim()} - ${dateStr}`,
          schedule_type: scheduleData.schedule_type,
          schedule_data: scheduleData.schedule_data,
          collection_id: collection.collection_id
        };

        const scheduleRes = await axios.post(`${API_BASE_URL}/schedules`, schedulePayload, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (scheduleRes.status === 201) {
          const schedule = scheduleRes.data;
          alert(`Schedule "${schedule.name}" created successfully!\n\nYour searches will run according to the schedule.`);
          setSearches([]); // Clear the form
          setCollectionName(''); // Clear collection name
        }
      }
    } catch (error) {
      console.error('Failed to create schedule:', error);
      alert('Failed to create schedule. Please try again.');
    }
  };

  // CSV parsing function
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
          const parsedSearches: SearchItem[] = [];
          
          for (let i = 0; i < rowsToProcess.length; i++) {
            const line = rowsToProcess[i].trim();
            if (!line) continue;
            
            const columns = line.split(',').map(col => col.trim());
            
            // Expected format: Site, City, Country, CheckIn (YYYYMMDD), CheckOut (YYYYMMDD), StarRating, Adults [, POS]
            // Minimum 7 columns, optional 8th for POS
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
            
            // Parse dates - support both days offset (≤3 chars) and YYYYMMDD format
            let checkInDate: Date | null = null;
            let checkOutDate: Date | null = null;
            
            // Helper function to parse date from either format
            const parseDateFromCSV = (dateStr: string): Date | null => {
              if (!dateStr) return null;
              
              // Days offset format: string length ≤ 3
              if (dateStr.length <= 3) {
                const daysOffset = parseInt(dateStr, 10);
                // Validate: must be a valid number between 0-999
                if (!isNaN(daysOffset) && daysOffset >= 0 && daysOffset <= 999) {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0); // Reset time to midnight
                  const resultDate = new Date(today);
                  resultDate.setDate(today.getDate() + daysOffset);
                  return resultDate;
                }
                return null; // Invalid days offset
              }
              
              // YYYYMMDD format: string length === 8
              if (dateStr.length === 8) {
                const year = parseInt(dateStr.substring(0, 4));
                const month = parseInt(dateStr.substring(4, 6)) - 1; // JS months are 0-indexed
                const day = parseInt(dateStr.substring(6, 8));
                if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                  const resultDate = new Date(year, month, day);
                  // Validate date
                  if (resultDate.getFullYear() === year && 
                      resultDate.getMonth() === month && 
                      resultDate.getDate() === day) {
                    return resultDate;
                  }
                }
              }
              
              return null; // Invalid format
            };
            
            checkInDate = parseDateFromCSV(checkInStr);
            checkOutDate = parseDateFromCSV(checkOutStr);
            
            // Parse star rating (handle "4+" format)
            let starRating = parseInt(starRatingStr) || 1;
            let starRatingOrMore = false;
            if (starRatingStr && starRatingStr.includes('+')) {
              starRatingOrMore = true;
              starRating = parseInt(starRatingStr.replace('+', '')) || 1;
            }
            
            const adults = parseInt(adultsStr) || 2;
            // POS is optional 8th column, must be IN, UK, or US
            const pos = posValue && ['IN', 'UK', 'US'].includes(posValue.toUpperCase()) ? [posValue.toUpperCase()] : [];
            
            // Convert site code to full name (reverse mapping)
            // If it's already a full name, use it; otherwise convert code to name
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
            // Check if it's already a known full name
            const knownFullNames = ['EXPEDIA', 'PRICELINE', 'MARRIOTT', 'CHOICEHOTELS', 'BESTWESTERN', 'REDROOF', 'ACCORHOTELS', 'BOOKING'];
            const siteName = knownFullNames.includes(siteUpper) 
              ? siteUpper 
              : (siteCodeToName[siteUpper] || siteUpper);
            
            parsedSearches.push({
              id: `csv_${i}_${Date.now()}`,
              city,
              countryCode: country,
              website: { name: siteName },
              pos,
              checkInDate,
              checkOutDate,
              adults,
              starRating,
              starRatingOrMore
            });
          }
          
          resolve(parsedSearches);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const processCSVFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file.');
      return;
    }
    
    try {
      const parsedSearches = await parseCSVFile(file);
      if (parsedSearches.length === 0) {
        alert('No valid searches found in CSV file.');
        return;
      }
      setSearches(parsedSearches);
      alert(`Successfully parsed ${parsedSearches.length} search(es) from CSV.`);
    } catch (error) {
      console.error('CSV parsing error:', error);
      alert('Failed to parse CSV file. Please check the format.');
    }
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processCSVFile(file);
    // Reset file input
    event.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processCSVFile(file);
    }
  };

  const handleSubmissionAction = async (action: 'start' | 'save') => {
    if (searches.length === 0) {
      alert('Please add at least one search before proceeding.');
      return;
    }
    if (!collectionName || collectionName.trim() === '') {
      alert('Please enter a collection name before proceeding.');
      return;
    }
    if (!token) {
      alert('Please login to perform this action.');
      return;
    }
    setSubmitting(true);
    try {
      const searchData = searches.map(search => ({
        website: { name: search.website.name, pos: search.pos },
        location: `${search.city}, ${search.countryCode}`,
        checkInDate: search.checkInDate ? format(search.checkInDate, 'yyyy-MM-dd') : null,
        checkOutDate: search.checkOutDate ? format(search.checkOutDate, 'yyyy-MM-dd') : null,
        adults: search.adults,
        starRating: search.starRatingOrMore ? `${search.starRating}+` : search.starRating.toString()
      }));
      const payload: any = { 
        jobs: searchData, 
        action,
        collection_name: collectionName.trim()
      };
      const res = await axios.post(`${API_BASE_URL}/save-multi-form`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.data?.success) {
        let message = '';
        if (action === 'start') message = `Started ${searches.length} search(es) and recorded collection.`;
        if (action === 'save') message = `Saved ${searches.length} search(es) as a collection.`;
        alert(message);
        if (action !== 'save') {
          setSearches([]);
          setCollectionName(''); // Clear collection name
        }
      } else {
        alert(res.data?.message || 'Request failed.');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error processing searches. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto', px: { xs: 2, sm: 4 }, py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 2 }}>
          Hotel Search Collection
        </Typography>
      </Box>

      {/* Search Method Selection Cards */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#0F172A', fontFamily: '"Urbanist", sans-serif' }}>
          Choose Search Method
        </Typography>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
          gap: 3,
          mb: 4
        }}>
          {/* Manual Search Card */}
          <Paper
            onClick={() => {
              if (editingSearchId) {
                setEditingSearchId(null);
                resetForm();
              }
              setActiveTab(0);
            }}
            sx={{
              p: 3,
              cursor: 'pointer',
              border: activeTab === 0 ? '2px solid #6818A5' : '2px solid #E5E5E5',
              borderRadius: 2,
              backgroundColor: activeTab === 0 ? '#F7F4FD' : '#FFFFFF',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: '#6818A5',
                backgroundColor: '#F7F4FD',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(104, 24, 165, 0.15)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  backgroundColor: activeTab === 0 ? '#6818A5' : '#F7F4FD',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.3s ease',
                }}
              >
                <EditNoteIcon 
                  sx={{ 
                    fontSize: 20, 
                    color: activeTab === 0 ? '#FFFFFF' : '#6818A5',
                    transition: 'color 0.3s ease',
                  }} 
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 800, 
                    color: '#0F172A', 
                    mb: 1,
                    fontFamily: '"Urbanist", sans-serif',
                  }}
                >
                  Search Manually
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#1E293B', 
                    fontWeight: 500,
                    fontFamily: '"Urbanist", sans-serif',
                    lineHeight: 1.6,
                  }}
                >
                  Fill out the form to create individual inputs
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* CSV Upload Card */}
          <Paper
            onClick={() => {
              if (editingSearchId) {
                setEditingSearchId(null);
                resetForm();
              }
              setActiveTab(1);
            }}
            sx={{
              p: 3,
              cursor: 'pointer',
              border: activeTab === 1 ? '2px solid #6818A5' : '2px solid #E5E5E5',
              borderRadius: 2,
              backgroundColor: activeTab === 1 ? '#F7F4FD' : '#FFFFFF',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: '#6818A5',
                backgroundColor: '#F7F4FD',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(104, 24, 165, 0.15)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  backgroundColor: activeTab === 1 ? '#6818A5' : '#F7F4FD',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.3s ease',
                }}
              >
                <FileUploadIcon 
                  sx={{ 
                    fontSize: 20, 
                    color: activeTab === 1 ? '#FFFFFF' : '#6818A5',
                    transition: 'color 0.3s ease',
                  }} 
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 800, 
                    color: '#0F172A', 
                    mb: 1,
                    fontFamily: '"Urbanist", sans-serif',
                  }}
                >
                  Upload CSV File
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#1E293B', 
                    fontWeight: 500,
                    fontFamily: '"Urbanist", sans-serif',
                    lineHeight: 1.6,
                  }}
                >
                  Upload a CSV file to bulk import multiple inputs at once.
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Content Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        {/* Heading - Always visible */}
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 800, color: '#0F172A' }}>
          {editingSearchId ? 'Edit Collection' : 'Create Your Collection'}
        </Typography>

        {/* Collection Name Input - Always visible */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700, color: '#0F172A' }}>
            Collection Name <span style={{ color: '#EF4444', fontWeight: 400, fontSize: '0.875rem' }}></span>
          </Typography>
          <TextField
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            placeholder="Enter a name for this collection (e.g., 'Summer Hotels 2025')"
            fullWidth
            required
            error={collectionName.trim() === '' && (submitting || searches.length > 0)}
            helperText={collectionName.trim() === '' && (submitting || searches.length > 0) ? 'Collection name is required' : ''}
            sx={{ 
              '& .MuiOutlinedInput-root': { height: '48px' },
              '& input::placeholder': {
                color: '#CBD5E1',
                fontWeight: 350,
                opacity: 1
              }
            }}
          />
        </Box>

        {/* Tab Panel 0: Manual Search */}
        {activeTab === 0 && (
          <Box data-form-section>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

            {/* Website and POS Selection */}
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700, color: '#0F172A' }}>
                  Select Hotel Website
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={selectedWebsite?.name || ''}
                    onChange={handleWebsiteChange}
                    displayEmpty
                    sx={{ '& .MuiOutlinedInput-root': { height: '48px' } }}
                  >
                    <MenuItem value="" disabled>
                      {sites.length === 0 ? 'No sites available' : 'Select a website'}
                    </MenuItem>
                    {sites.map((siteName) => (
                      <MenuItem key={siteName} value={siteName}>
                        {siteName}
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
                    value={selectedPOS}
                    onChange={handlePOSChange}
                    displayEmpty
                    disabled={!selectedWebsite || posOptions.length === 0}
                    sx={{ '& .MuiOutlinedInput-root': { height: '48px' } }}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((pos) => (
                          <Chip key={pos} label={pos} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    <MenuItem value="" disabled>
                      {!selectedWebsite ? 'Select website first' : (posOptions.length === 0 ? 'No POS available' : 'Select POS')}
                    </MenuItem>
                    {posOptions.map((pos) => (
                      <MenuItem key={pos} value={pos}>{pos}</MenuItem>
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
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city name"
                  fullWidth
                  sx={{ 
                    '& .MuiOutlinedInput-root': { height: '48px' },
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
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    displayEmpty
                    sx={{ height: '48px' }}
                  >
                    <MenuItem value="" disabled>
                      Select country
                    </MenuItem>
                    {countryCodes.map((code) => (
                      <MenuItem key={code} value={code}>{code}</MenuItem>
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
                    value={checkInDate}
                    onChange={setCheckInDate}
                    minDate={startOfToday()}
                    slotProps={{
                      textField: { 
                        fullWidth: true, 
                        sx: { 
                          '& .MuiOutlinedInput-root': { height: '48px' },
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
                    value={checkOutDate}
                    onChange={setCheckOutDate}
                    minDate={checkInDate || startOfToday()}
                    slotProps={{
                      textField: { 
                        fullWidth: true, 
                        sx: { 
                          '& .MuiOutlinedInput-root': { height: '48px' },
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
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    sx={{ '& .MuiOutlinedInput-root': { height: '48px' } }}
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <MenuItem key={num} value={num}>{num}</MenuItem>
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
                      value={starRating}
                      onChange={(e) => setStarRating(Number(e.target.value))}
                      sx={{ '& .MuiOutlinedInput-root': { height: '48px' } }}
                    >
                      {[1, 2, 3, 4, 5].map((stars) => (
                        <MenuItem key={stars} value={stars}>{stars}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={starRatingOrMore}
                        onChange={(e) => setStarRatingOrMore(e.target.checked)}
                      />
                    }
                    label="or more"
                  />
                </Box>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              {editingSearchId && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setEditingSearchId(null);
                    resetForm();
                  }}
                  sx={{ flex: 1, borderRadius: 2 }}
                >
                  Cancel Edit
                </Button>
              )}
              <Button
                variant="contained"
                onClick={editingSearchId ? handleUpdateSearch : handleAddSearch}
                disabled={!validateCurrentSearch()}
                startIcon={<AddIcon sx={{ color: '#FFFFFF' }} />}
                sx={{ 
                  flex: 1,
                  backgroundColor: '#6818A5',
                  borderRadius: 2,
                  '&:hover': { backgroundColor: '#5a1594' }
                }}
              >
                {editingSearchId ? 'Update Search' : 'Add Search'}
              </Button>
            </Box>
            </Box>
          </Box>
        )}

        {/* Tab Panel 1: CSV Upload */}
        {activeTab === 1 && (
          <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', lg: 'row' } }}>
            {/* Left Section - Information */}
            <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 50%' } }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {[

                  'Upload a CSV file to add multiple searches at once.',
                  'The CSV file should have the following columns:',
                  'Location, Website, Dates, Adults, Star Rating, POS (optional)',
                  
                ].map((text, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: '#F7F4FD',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <CheckCircleIcon sx={{ color: '#6818A5', fontSize: 16 }} />
                    </Box>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: '#1E293B', 
                        fontWeight: 600, 
                        fontFamily: '"Urbanist", sans-serif' 
                      }}
                    >
                      {text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Right Section - Upload Component */}
            <Box sx={{ flex: { xs: '1 1 100%', lg: '1 1 50%' } }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 700, 
                  color: '#1E293B',
                  fontFamily: '"Urbanist", sans-serif'
                }}
              >
                Upload document
              </Typography>
              
              <input
                accept=".csv"
                style={{ display: 'none' }}
                id="csv-upload-input"
                type="file"
                onChange={handleCSVUpload}
              />
              
              <Box
                component="label"
                htmlFor="csv-upload-input"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '300px',
                  border: '2px dashed #6818A5',
                  borderRadius: 2,
                  backgroundColor: isDragging ? '#F0E8FF' : '#F7F4FD',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#F0E8FF',
                    borderColor: '#5a1594',
                  },
                  position: 'relative',
                }}
              >
                <CloudUploadIcon 
                  sx={{ 
                    fontSize: 64, 
                    color: '#6818A5', 
                    mb: 2 
                  }} 
                />
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#1E293B', 
                    fontWeight: 600, 
                    mb: 3,
                    fontFamily: '"Urbanist", sans-serif',
                    textAlign: 'center',
                    px: 2
                  }}
                >
                  Select a CSV file to upload or drag & drop it here
                </Typography>
                <Button
                  variant="contained"
                  component="span"
                  endIcon={<ArrowUpwardIcon sx={{ color: '#FFFFFF' }} />}
                  sx={{
                    backgroundColor: '#6818A5',
                    '&:hover': { backgroundColor: '#5a1594' },
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    fontFamily: '"Urbanist", sans-serif',
                    fontWeight: 600,
                    textTransform: 'none',
                  }}
                >
                  Upload a File
                </Button>
              </Box>

              {searches.length > 0 && activeTab === 1 && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  {searches.length} search(es) loaded from CSV. Review them in the table below.
                </Alert>
              )}
            </Box>
          </Box>
        )}
      </Paper>

    {/* Review Table */}
    {searches.length > 0 && (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 800, color: '#0F172A' }}>
          Review Table
        </Typography>

        <TableContainer sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F8FAFC' }}>
                <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>#</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Websites</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Dates</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Adults</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Star Rating</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {searches.map((search, index) => (
                <TableRow key={search.id}>
                  <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>{index + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>{`${search.city}, ${search.countryCode}`}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                    <Chip
                      label={`${search.website.name}${search.pos.length ? ` (${search.pos.join(', ')})` : ''}`}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                    {search.checkInDate && search.checkOutDate && (
                      `${format(search.checkInDate, 'MMM dd')} - ${format(search.checkOutDate, 'MMM dd')}`
                    )}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>{search.adults}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1E293B' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {Array.from({ length: search.starRating }, (_, i) => (
                        <img
                          key={i}
                          src={starIcon}
                          alt="star"
                          style={{ width: 16, height: 16 }}
                        />
                      ))}
                      {search.starRatingOrMore && (
                        <Typography
                          component="span"
                          sx={{
                            fontWeight: 600,
                            color: '#1E293B',
                            ml: 0.5,
                            fontSize: '0.875rem'
                          }}
                        >
                          +
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleEditSearch(search)}
                      sx={{ 
                        color: '#0F172A',
                        '&:hover': { backgroundColor: '#F7F4FD' }
                      }}
                    >
                      <img 
                        src={editIcon} 
                        alt="Edit" 
                        style={{ width: 20, height: 20 }}
                      />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteSearch(search.id)}
                      sx={{ 
                        color: '#0F172A',
                        '&:hover': { backgroundColor: '#F7F4FD' }
                      }}
                    >
                      <img 
                        src={deleteIcon} 
                        alt="Delete" 
                        style={{ width: 20, height: 20 }}
                      />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Alert severity="info" sx={{ mb: 3 }}>
          You have {searches.length} search(es) ready. Choose an action below.
          {searches.length === 1 && (
            <Box sx={{ mt: 1 }}>
              💡 <strong>Tip:</strong> You can add more searches by filling out the form above and clicking "Add Search".
            </Box>
          )}
        </Alert>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon sx={{ color: '#FFFFFF' }} />}
            onClick={() => handleSubmissionAction('start')}
            disabled={submitting}
            sx={{ backgroundColor: '#6818A5', borderRadius: 2, '&:hover': { backgroundColor: '#5a1594' } }}
          >
            Start & Save
          </Button>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={() => handleSubmissionAction('save')}
            disabled={submitting}
            sx={{ borderColor: '#6818A5', color: '#6818A5', borderRadius: 2, '&:hover': { borderColor: '#5a1594', backgroundColor: '#F3F4F6' } }}
          >
            Save
          </Button>
          <Button
            variant="outlined"
            startIcon={<ScheduleIcon />}
            onClick={() => setScheduleOpen(true)}
            disabled={submitting}
            sx={{ borderColor: '#6818A5', color: '#6818A5', borderRadius: 2, '&:hover': { borderColor: '#5a1594', backgroundColor: '#F3F4F6' } }}
          >
            Schedule
          </Button>
        </Box>
      </Paper>
    )}

      {/* Schedule Scheduler Dialog */}
      <ScheduleScheduler
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        onSchedule={handleScheduleConfirm}
      />
    </Box>
  );
};

export default MultiSearchForm;
