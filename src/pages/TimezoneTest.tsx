import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Box, Alert } from '@mui/material';
import { timezoneService } from '../services/timezoneService';
import { useAuth } from '../contexts/AuthContext';

const TimezoneTestPage: React.FC = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [currentTimezone, setCurrentTimezone] = useState<string>('UTC');

  useEffect(() => {
    if (user?.timezone) {
      setCurrentTimezone(user.timezone);
      timezoneService.setUserTimezone(user.timezone);
    }
  }, [user]);

  const runTimezoneTest = () => {
    const results: string[] = [];
    
    results.push(`Current User Timezone: ${currentTimezone}`);
    results.push(`Timezone Service Timezone: ${timezoneService.getUserTimezone()}`);
    
    // Test current time
    const now = new Date();
    results.push(`Current UTC Time: ${now.toISOString()}`);
    results.push(`Current User Time: ${timezoneService.formatForUser(now, 'datetime')}`);
    
    // Test a specific UTC timestamp
    const testUTC = '2025-01-15T14:00:00Z';
    results.push(`Test UTC Time: ${testUTC}`);
    results.push(`Test User Time: ${timezoneService.formatForUser(testUTC, 'datetime')}`);
    
    // Test API response conversion
    const testApiData = {
      created_at: '2025-01-15T14:00:00Z',
      updated_at: '2025-01-15T15:30:00Z',
      name: 'Test Item'
    };
    
    const convertedData = timezoneService.convertAPIResponse(testApiData);
    results.push(`API Conversion Test:`);
    results.push(`  Created: ${convertedData.created_at}`);
    results.push(`  Updated: ${convertedData.updated_at}`);
    results.push(`  Name: ${convertedData.name}`);
    
    setTestResults(results);
  };

  const testDifferentTimezones = () => {
    const timezones = ['UTC', 'Asia/Kolkata', 'America/New_York', 'Europe/London'];
    const results: string[] = [];
    
    timezones.forEach(tz => {
      timezoneService.setUserTimezone(tz);
      const testTime = '2025-01-15T14:00:00Z';
      const formatted = timezoneService.formatForUser(testTime, 'datetime');
      results.push(`${tz}: ${testTime} → ${formatted}`);
    });
    
    // Reset to user's timezone
    if (user?.timezone) {
      timezoneService.setUserTimezone(user.timezone);
    }
    
    setTestResults(results);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Timezone Test Page
      </Typography>
      
      <Alert severity="info" sx={{ mb: 2 }}>
        This page helps debug timezone conversion issues for user: {user?.email} (Timezone: {user?.timezone || 'Not set'})
      </Alert>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button variant="contained" onClick={runTimezoneTest}>
          Test Current Timezone
        </Button>
        <Button variant="outlined" onClick={testDifferentTimezones}>
          Test Different Timezones
        </Button>
      </Box>
      
      {testResults.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Test Results:
            </Typography>
            {testResults.map((result, index) => (
              <Typography key={index} variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5 }}>
                {result}
              </Typography>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default TimezoneTestPage;
