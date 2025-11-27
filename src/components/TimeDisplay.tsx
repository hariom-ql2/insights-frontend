import React from 'react';
import { timezoneService } from '../services/timezoneService';

interface TimeDisplayProps {
  timestamp: string | Date;
  format?: 'date' | 'time' | 'datetime' | 'full' | 'relative';
  className?: string;
  showTimezone?: boolean;
}

export const TimeDisplay: React.FC<TimeDisplayProps> = ({ 
  timestamp, 
  format = 'datetime', 
  className = '',
  showTimezone = false 
}) => {
  const formatTime = () => {
    if (format === 'relative') {
      return timezoneService.formatRelativeTime(timestamp);
    }
    
    const formatted = timezoneService.formatForUser(timestamp, format);
    
    if (showTimezone) {
      const timezone = timezoneService.getUserTimezone();
      return `${formatted} (${timezone})`;
    }
    
    return formatted;
  };

  return (
    <span className={className} title={timezoneService.formatForUser(timestamp, 'full')}>
      {formatTime()}
    </span>
  );
};

export default TimeDisplay;
