// Comprehensive timezone utility service for frontend
export class TimezoneService {
  private static instance: TimezoneService;
  private userTimezone: string = 'UTC';

  private constructor() {
    // Initialize with user's timezone from localStorage or default to UTC
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.userTimezone = user.timezone || 'UTC';
      } catch (error) {
        console.warn('Failed to parse user data for timezone:', error);
      }
    }
  }

  public static getInstance(): TimezoneService {
    if (!TimezoneService.instance) {
      TimezoneService.instance = new TimezoneService();
    }
    return TimezoneService.instance;
  }

  // Set user's timezone
  public setUserTimezone(timezone: string): void {
    this.userTimezone = timezone;
  }

  // Get user's timezone
  public getUserTimezone(): string {
    return this.userTimezone;
  }

  // Convert UTC date to user's timezone for display
  public convertFromUTC(utcDate: Date | string): Date {
    const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
    
    // Simply return the date as-is since formatForUser will handle timezone display
    return date;
  }

  // Convert user's timezone date to UTC for API calls
  public convertToUTC(userDate: Date | string): Date {
    const date = typeof userDate === 'string' ? new Date(userDate) : userDate;
    
    // Return the date as-is since the backend will handle timezone conversion
    return date;
  }

  // Format date for display in user's timezone
  public formatForUser(date: Date | string, format: 'date' | 'time' | 'datetime' | 'full' = 'datetime'): string {
    try {
      const dateObj = typeof date === 'string' ? this.parseDateString(date) : date;
      
      // Always treat the input as UTC and convert to user's timezone
      const utcDate = new Date(dateObj.getTime());
      
      const options: Intl.DateTimeFormatOptions = {
        timeZone: this.userTimezone,
      };

      switch (format) {
        case 'date':
          options.year = 'numeric';
          options.month = '2-digit';
          options.day = '2-digit';
          break;
        case 'time':
          options.hour = '2-digit';
          options.minute = '2-digit';
          options.hour12 = false;
          break;
        case 'datetime':
          options.year = 'numeric';
          options.month = '2-digit';
          options.day = '2-digit';
          options.hour = '2-digit';
          options.minute = '2-digit';
          options.hour12 = false;
          break;
        case 'full':
          options.year = 'numeric';
          options.month = '2-digit';
          options.day = '2-digit';
          options.hour = '2-digit';
          options.minute = '2-digit';
          options.second = '2-digit';
          options.hour12 = false;
          break;
      }

      return utcDate.toLocaleString('en-US', options);
    } catch (error) {
      console.warn('Error formatting date for user:', error);
      return typeof date === 'string' ? date : date.toString();
    }
  }

  // Format date for API (always UTC)
  public formatForAPI(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString();
  }

  // Get current time in user's timezone
  public getCurrentUserTime(): Date {
    return this.convertFromUTC(new Date());
  }

  // Get current time in UTC
  public getCurrentUTCTime(): Date {
    return new Date();
  }

  // Parse schedule time from user input and convert to UTC for API
  public parseScheduleTime(dateTimeStr: string): string {
    // Create date in user's timezone
    const userDate = new Date(dateTimeStr);
    
    // Convert to UTC
    const utcDate = this.convertToUTC(userDate);
    
    return utcDate.toISOString();
  }

  // Format schedule time for display
  public formatScheduleTime(utcDateTimeStr: string): string {
    const utcDate = new Date(utcDateTimeStr);
    return this.formatForUser(utcDate, 'datetime');
  }

  // Parse date string with support for multiple formats - always treat as UTC
  private parseDateString(dateStr: string): Date {
    try {
      // Try parsing RFC3339 format first (with timezone info)
      if (dateStr.includes('T') && (dateStr.includes('+') || dateStr.includes('-') || dateStr.endsWith('Z'))) {
        const date = new Date(dateStr);
        // Return the date as-is since it already has timezone info
        return date;
      }

      // Try parsing DD-MM-YYYY HH:MM:SS format (treat as UTC)
      const ddmmyyyyMatch = dateStr.match(/^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})$/);
      if (ddmmyyyyMatch) {
        const [, day, month, year, hour, minute, second] = ddmmyyyyMatch;
        // Create date in UTC
        return new Date(Date.UTC(
          parseInt(year),
          parseInt(month) - 1, // Month is 0-indexed
          parseInt(day),
          parseInt(hour),
          parseInt(minute),
          parseInt(second)
        ));
      }

      // Try parsing YYYY-MM-DD HH:MM:SS format (treat as UTC)
      const yyyymmddMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
      if (yyyymmddMatch) {
        const [, year, month, day, hour, minute, second] = yyyymmddMatch;
        // Create date in UTC
        return new Date(Date.UTC(
          parseInt(year),
          parseInt(month) - 1, // Month is 0-indexed
          parseInt(day),
          parseInt(hour),
          parseInt(minute),
          parseInt(second)
        ));
      }

      // Try parsing YYYY-MM-DD format (treat as UTC)
      const yyyymmddDateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (yyyymmddDateMatch) {
        const [, year, month, day] = yyyymmddDateMatch;
        // Create date in UTC
        return new Date(Date.UTC(
          parseInt(year),
          parseInt(month) - 1, // Month is 0-indexed
          parseInt(day)
        ));
      }

      // Fall back to standard Date parsing
      const date = new Date(dateStr);
      return new Date(date.getTime());
    } catch (error) {
      console.warn('Error parsing date string:', dateStr, error);
      return new Date();
    }
  }

  // Get timezone offset in hours
  public getTimezoneOffset(timezone?: string): number {
    const tz = timezone || this.userTimezone;
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const targetTime = new Date(utcTime + (this.getTimezoneOffsetMinutes(tz) * 60000));
    return (targetTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  }

  // Get timezone offset in minutes
  private getTimezoneOffsetMinutes(timezone: string): number {
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const targetTime = new Date(utcTime);
    const targetTimeInTz = new Date(targetTime.toLocaleString('en-US', { timeZone: timezone }));
    return (targetTimeInTz.getTime() - targetTime.getTime()) / (1000 * 60);
  }

  // Validate timezone
  public validateTimezone(timezone: string): boolean {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get common timezones
  public getCommonTimezones(): Array<{ value: string; label: string }> {
    return [
      { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
      { value: 'America/New_York', label: 'Eastern Time (ET)' },
      { value: 'America/Chicago', label: 'Central Time (CT)' },
      { value: 'America/Denver', label: 'Mountain Time (MT)' },
      { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
      { value: 'Europe/London', label: 'London (GMT/BST)' },
      { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
      { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
      { value: 'Europe/Rome', label: 'Rome (CET/CEST)' },
      { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
      { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
      { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
      { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST)' },
      { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
      { value: 'Australia/Melbourne', label: 'Melbourne (AEST/AEDT)' },
      { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)' },
    ];
  }

  // Format relative time (e.g., "2 hours ago", "in 3 days")
  public formatRelativeTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = this.getCurrentUserTime();
    const diffMs = dateObj.getTime() - now.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (Math.abs(diffDays) >= 1) {
      return diffDays > 0 ? `in ${diffDays} day${diffDays > 1 ? 's' : ''}` : `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} ago`;
    } else if (Math.abs(diffHours) >= 1) {
      return diffHours > 0 ? `in ${diffHours} hour${diffHours > 1 ? 's' : ''}` : `${Math.abs(diffHours)} hour${Math.abs(diffHours) > 1 ? 's' : ''} ago`;
    } else if (Math.abs(diffMinutes) >= 1) {
      return diffMinutes > 0 ? `in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}` : `${Math.abs(diffMinutes)} minute${Math.abs(diffMinutes) > 1 ? 's' : ''} ago`;
    } else {
      return 'just now';
    }
  }

  // Convert API response timestamps to user timezone for display
  public convertAPIResponse(data: any): any {
    if (!data) return data;

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => this.convertAPIResponse(item));
    }

    // Handle objects
    if (typeof data === 'object') {
      const converted: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Convert timestamp fields
        if (this.isTimestampField(key) && typeof value === 'string') {
          // Format the timestamp for display in user's timezone
          converted[key] = this.formatForUser(value, 'datetime');
        } else if (typeof value === 'object') {
          converted[key] = this.convertAPIResponse(value);
        } else {
          converted[key] = value;
        }
      }
      return converted;
    }

    return data;
  }

  // Convert user input data to UTC for API requests
  public convertUserInputToUTC(data: any): any {
    if (!data) return data;

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => this.convertUserInputToUTC(item));
    }

    // Handle objects
    if (typeof data === 'object') {
      const converted: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Convert timestamp fields from user timezone to UTC
        if (this.isTimestampField(key) && typeof value === 'string') {
          converted[key] = this.formatForAPI(value);
        } else if (typeof value === 'object') {
          converted[key] = this.convertUserInputToUTC(value);
        } else {
          converted[key] = value;
        }
      }
      return converted;
    }

    return data;
  }

  // Check if a field name represents a timestamp
  private isTimestampField(fieldName: string): boolean {
    const timestampFields = [
      'created_at', 'updated_at', 'last_run_at', 'next_run_at', 
      'started_at', 'completed_at', 'scheduled_at', 'timestamp',
      'check_in_date', 'check_out_date', 'date_time'
    ];
    return timestampFields.includes(fieldName.toLowerCase());
  }

  // Format date for form input (YYYY-MM-DD format)
  public formatForFormInput(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
  }

  // Parse form input date and convert to UTC for API
  public parseFormInput(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return this.formatForAPI(date);
  }

  // Convert schedule timestamp from YYYYMMDDHHMI format to UTC ISO string
  public parseScheduleTimestamp(timestamp: string): string {
    if (timestamp.length !== 12) {
      throw new Error('Invalid timestamp format. Expected YYYYMMDDHHMI');
    }

    const year = timestamp.substring(0, 4);
    const month = timestamp.substring(4, 6);
    const day = timestamp.substring(6, 8);
    const hour = timestamp.substring(8, 10);
    const minute = timestamp.substring(10, 12);

    // Create date in user's timezone
    const userDateStr = `${year}-${month}-${day}T${hour}:${minute}:00`;
    const userDate = new Date(userDateStr);

    // Convert to UTC
    return this.formatForAPI(userDate);
  }

  // Format schedule timestamp for display from UTC ISO string
  public formatScheduleTimestamp(utcIsoString: string): string {
    const utcDate = new Date(utcIsoString);
    return this.formatForUser(utcDate, 'datetime');
  }
}

// Export singleton instance
export const timezoneService = TimezoneService.getInstance();
