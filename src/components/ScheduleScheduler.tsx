import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  Chip,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, addMinutes } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ScheduleIcon from '@mui/icons-material/Schedule';
import RepeatIcon from '@mui/icons-material/Repeat';
import { useAuth } from '../contexts/AuthContext';
import { timezoneService } from '../services/timezoneService';

interface ScheduleSchedulerProps {
  open: boolean;
  onClose: () => void;
  onSchedule: (scheduleData: any) => void;
  initialDate?: Date;
}

type ScheduleType = 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly';

const ScheduleScheduler: React.FC<ScheduleSchedulerProps> = ({
  open,
  onClose,
  onSchedule,
  initialDate
}) => {
  const { user } = useAuth();
  const [scheduleType, setScheduleType] = useState<ScheduleType>('once');
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    initialDate || addMinutes(new Date(), 30)
  );
  const [selectedTime, setSelectedTime] = useState<Date | null>(
    initialDate || addMinutes(new Date(), 30)
  );
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // Monday
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [error, setError] = useState<string>('');

  // Get user's timezone or default to UTC
  const userTimezone = user?.timezone || 'UTC';

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      const defaultDate = initialDate || addMinutes(new Date(), 30);
      setSelectedDate(defaultDate);
      setSelectedTime(defaultDate);
      setStartDate(new Date());
      setError('');
    }
  }, [open, initialDate]);

  const validateScheduleTime = (): boolean => {
    if (!selectedDate || !selectedTime) {
      setError('Please select both date and time');
      return false;
    }

    // Combine date and time
    const combinedDateTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      selectedTime.getHours(),
      selectedTime.getMinutes()
    );

    const now = new Date();
    const minTime = addMinutes(now, 5);

    if (combinedDateTime < minTime) {
      setError('Scheduled time must be at least 5 minutes in the future');
      return false;
    }

    return true;
  };

  const handleSchedule = () => {
    if (!validateScheduleTime() || !selectedDate || !selectedTime) return;

    try {
      // Combine date and time
      const combinedDateTime = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes()
      );

      let scheduleData: any = {};

      switch (scheduleType) {
        case 'once':
          // Convert to UTC for API
          const utcDateTime = timezoneService.parseScheduleTime(combinedDateTime.toISOString());
          scheduleData = {
            schedule_type: 'once',
            schedule_data: {
              date_time: utcDateTime,
              timezone: userTimezone
            }
          };
          break;

        case 'daily':
          scheduleData = {
            schedule_type: 'daily',
            schedule_data: {
              time: format(selectedTime, 'HH:mm'),
              timezone: userTimezone
            }
          };
          break;

        case 'weekly':
          scheduleData = {
            schedule_type: 'weekly',
            schedule_data: {
              day_of_week: dayOfWeek,
              time: format(selectedTime, 'HH:mm'),
              timezone: userTimezone
            }
          };
          break;

        case 'biweekly':
          scheduleData = {
            schedule_type: 'biweekly',
            schedule_data: {
              day_of_week: dayOfWeek,
              time: format(selectedTime, 'HH:mm'),
              timezone: userTimezone,
              start_date: startDate ? format(startDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
            }
          };
          break;

        case 'monthly':
          scheduleData = {
            schedule_type: 'monthly',
            schedule_data: {
              day_of_month: dayOfMonth,
              time: format(selectedTime, 'HH:mm'),
              timezone: userTimezone
            }
          };
          break;
      }

      onSchedule(scheduleData);
      onClose();
    } catch (err) {
      setError('Invalid date/time selection. Please try again.');
    }
  };

  const getCurrentTimeInTimezone = (timezone: string): string => {
    try {
      const now = new Date();
      const zonedTime = toZonedTime(now, timezone);
      return format(zonedTime, 'MMM dd, yyyy - HH:mm');
    } catch {
      return 'Invalid timezone';
    }
  };

  const getSchedulePreview = (): string => {
    if (!selectedDate || !selectedTime) return '';

    const combinedDateTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      selectedTime.getHours(),
      selectedTime.getMinutes()
    );

    const timeStr = format(selectedTime, 'HH:mm');
    const dateStr = format(combinedDateTime, 'MMM dd, yyyy');

    switch (scheduleType) {
      case 'once':
        return `Once: ${dateStr} at ${timeStr} (${userTimezone})`;
      case 'daily':
        return `Daily: Every day at ${timeStr} (${userTimezone})`;
      case 'weekly':
        const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return `Weekly: Every ${weekDays[dayOfWeek]} at ${timeStr} (${userTimezone})`;
      case 'biweekly':
        const biweekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return `Biweekly: Every other ${biweekDays[dayOfWeek]} at ${timeStr} (${userTimezone})`;
      case 'monthly':
        return `Monthly: Day ${dayOfMonth} of every month at ${timeStr} (${userTimezone})`;
      default:
        return '';
    }
  };

  const weekDays = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ScheduleIcon color="primary" />
          <Typography variant="h6" component="div">
            Schedule Search Collection
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Choose how often you want your search collection to run
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* User Timezone Display */}
        <Paper sx={{ p: 2, backgroundColor: 'grey.50', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <AccessTimeIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>
              Your Timezone
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
            // userTimezone would be in white color
              label={userTimezone} 
              color="default" 
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
            <Typography variant="body2" color="text.secondary">
              Current time: {getCurrentTimeInTimezone(userTimezone)}
            </Typography>
          </Box>
        </Paper>

        {/* Schedule Type Selection */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Schedule Type
          </Typography>
          <FormControl fullWidth>
            <RadioGroup
              value={scheduleType}
              onChange={(e) => {
                setScheduleType(e.target.value as ScheduleType);
                setError('');
              }}
              row
              sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 1,
                justifyContent: 'space-between'
              }}
            >
              <FormControlLabel 
                value="once" 
                control={<Radio />} 
                label="Once" 
                sx={{ 
                  flex: '1 1 18%',
                  minWidth: '120px',
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }
                }}
              />
              <FormControlLabel 
                value="daily" 
                control={<Radio />} 
                label="Daily" 
                sx={{ 
                  flex: '1 1 18%',
                  minWidth: '120px',
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }
                }}
              />
              <FormControlLabel 
                value="weekly" 
                control={<Radio />} 
                label="Weekly" 
                sx={{ 
                  flex: '1 1 18%',
                  minWidth: '120px',
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }
                }}
              />
              <FormControlLabel 
                value="biweekly" 
                control={<Radio />} 
                label="Biweekly" 
                sx={{ 
                  flex: '1 1 18%',
                  minWidth: '120px',
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }
                }}
              />
              <FormControlLabel 
                value="monthly" 
                control={<Radio />} 
                label="Monthly" 
                sx={{ 
                  flex: '1 1 18%',
                  minWidth: '120px',
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }
                }}
              />
            </RadioGroup>
          </FormControl>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Schedule Configuration */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Schedule Configuration
          </Typography>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Date selection for once schedule */}
              {scheduleType === 'once' && (
                <DatePicker
                  label="Date"
                  value={selectedDate}
                  onChange={(newValue) => {
                    setSelectedDate(newValue);
                    setError('');
                  }}
                  minDate={new Date()}
                  sx={{ width: '100%' }}
                />
              )}

              {/* Time selection */}
              <TimePicker
                label="Time"
                value={selectedTime}
                onChange={(newValue) => {
                  setSelectedTime(newValue);
                  setError('');
                }}
                sx={{ width: '100%' }}
              />

              {/* Day of week for weekly/biweekly */}
              {(scheduleType === 'weekly' || scheduleType === 'biweekly') && (
                <FormControl fullWidth>
                  <InputLabel>Day of Week</InputLabel>
                  <Select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value as number)}
                    label="Day of Week"
                  >
                    {weekDays.map((day) => (
                      <MenuItem key={day.value} value={day.value}>
                        {day.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Start date for biweekly */}
              {scheduleType === 'biweekly' && (
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  minDate={new Date()}
                  sx={{ width: '100%' }}
                />
              )}

              {/* Day of month for monthly */}
              {scheduleType === 'monthly' && (
                <FormControl fullWidth>
                  <InputLabel>Day of Month</InputLabel>
                  <Select
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(e.target.value as number)}
                    label="Day of Month"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <MenuItem key={day} value={day}>
                        {day}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          </LocalizationProvider>
        </Box>

        {/* Preview */}
        {selectedDate && selectedTime && (
          <Paper sx={{ p: 2, backgroundColor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Schedule Preview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {getSchedulePreview()}
            </Typography>
          </Paper>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} color="primary" sx={{ color: '#6818A5', '&:hover': { backgroundColor: '#F7F4FD' } }}>
          Cancel
        </Button>
        <Button 
          onClick={handleSchedule} 
          variant="contained" 
          // make icon white color
          startIcon={<RepeatIcon sx={{ color: '#FFFFFF' }} />}
          disabled={!selectedDate || !selectedTime}
        >
          Create Schedule
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleScheduler;
