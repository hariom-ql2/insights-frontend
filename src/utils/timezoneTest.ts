// Comprehensive timezone conversion test utility
import { timezoneService } from '../services/timezoneService';

export const testTimezoneConversion = () => {
  console.log('🧪 Testing Comprehensive Timezone Conversion System...');
  console.log('='.repeat(60));
  
  // Test various timezones
  const testDate = new Date('2025-01-15T14:00:00'); // 2:00 PM
  
  const timezones = [
    { tz: 'UTC', name: 'UTC' },
    { tz: 'Asia/Kolkata', name: 'IST (India)' },
    { tz: 'America/New_York', name: 'EST (New York)' },
    { tz: 'Europe/London', name: 'GMT (London)' },
    { tz: 'Asia/Tokyo', name: 'JST (Tokyo)' },
    { tz: 'Australia/Sydney', name: 'AEST (Sydney)' },
    { tz: 'Asia/Dubai', name: 'GST (Dubai)' },
    { tz: 'America/Sao_Paulo', name: 'BRT (São Paulo)' }
  ];
  
  console.log('📅 Test Date: 2025-01-15T14:00:00 (2:00 PM)');
  console.log('');
  
  timezones.forEach(({ tz, name }) => {
    console.log(`🌍 Testing ${name} (${tz}):`);
    
    // Set user timezone
    timezoneService.setUserTimezone(tz);
    
    // Test conversion from user timezone to UTC
    const utcTime = timezoneService.convertToUTC(testDate);
    const utcIsoString = timezoneService.formatForAPI(testDate);
    
    // Test conversion from UTC back to user timezone
    const userTime = timezoneService.convertFromUTC(utcTime);
    const userFormatted = timezoneService.formatForUser(utcTime, 'datetime');
    
    console.log(`   User Time: ${userFormatted}`);
    console.log(`   UTC Time:  ${utcIsoString}`);
    console.log(`   Offset:    ${timezoneService.getTimezoneOffset(tz)} hours`);
    console.log('');
  });
  
  console.log('🔄 Testing Schedule Timestamp Conversion:');
  console.log('-'.repeat(40));
  
  // Test schedule timestamp parsing
  const scheduleTimestamp = '202501151400'; // 2025-01-15 14:00
  timezones.forEach(({ tz, name }) => {
    timezoneService.setUserTimezone(tz);
    
    try {
      const utcIso = timezoneService.parseScheduleTimestamp(scheduleTimestamp);
      const displayTime = timezoneService.formatScheduleTimestamp(utcIso);
      
      console.log(`${name}: ${scheduleTimestamp} → ${displayTime} (UTC: ${utcIso})`);
    } catch (error) {
      console.log(`${name}: Error - ${error}`);
    }
  });
  
  console.log('');
  console.log('📊 Testing API Data Conversion:');
  console.log('-'.repeat(40));
  
  // Test API data conversion
  const testApiData = {
    created_at: '2025-01-15T14:00:00Z',
    updated_at: '2025-01-15T15:30:00Z',
    scheduled_at: '2025-01-16T09:00:00Z',
    check_in_date: '2025-01-20T00:00:00Z',
    check_out_date: '2025-01-25T00:00:00Z',
    user_info: {
      name: 'Test User',
      last_login: '2025-01-15T12:00:00Z'
    }
  };
  
  timezones.forEach(({ tz, name }) => {
    timezoneService.setUserTimezone(tz);
    
    const convertedData = timezoneService.convertAPIResponse(testApiData);
    
    console.log(`${name}:`);
    console.log(`  Created: ${convertedData.created_at}`);
    console.log(`  Updated: ${convertedData.updated_at}`);
    console.log(`  Scheduled: ${convertedData.scheduled_at}`);
    console.log('');
  });
  
  console.log('✅ Comprehensive timezone conversion test completed');
  console.log('='.repeat(60));
};

// Test specific scenarios
export const testSpecificScenarios = () => {
  console.log('🎯 Testing Specific Scenarios...');
  console.log('='.repeat(50));
  
  // Scenario 1: Indian user scheduling at 2 PM IST
  console.log('📋 Scenario 1: Indian user scheduling at 2 PM IST');
  timezoneService.setUserTimezone('Asia/Kolkata');
  
  const istScheduleTime = '202501151400'; // 2 PM IST
  const utcForIST = timezoneService.parseScheduleTimestamp(istScheduleTime);
  console.log(`IST 2 PM → UTC: ${utcForIST}`);
  
  // Scenario 2: Chinese user scheduling at 2 PM CST
  console.log('');
  console.log('📋 Scenario 2: Chinese user scheduling at 2 PM CST');
  timezoneService.setUserTimezone('Asia/Shanghai');
  
  const cstScheduleTime = '202501151400'; // 2 PM CST
  const utcForCST = timezoneService.parseScheduleTimestamp(cstScheduleTime);
  console.log(`CST 2 PM → UTC: ${utcForCST}`);
  
  // Scenario 3: Display UTC data to different users
  console.log('');
  console.log('📋 Scenario 3: Displaying UTC data to different users');
  const utcData = '2025-01-15T08:30:00Z'; // 8:30 AM UTC
  
  const users = [
    { tz: 'Asia/Kolkata', name: 'Indian User' },
    { tz: 'America/New_York', name: 'American User' },
    { tz: 'Europe/London', name: 'British User' }
  ];
  
  users.forEach(({ tz, name }) => {
    timezoneService.setUserTimezone(tz);
    const displayTime = timezoneService.formatForUser(utcData, 'datetime');
    console.log(`${name}: ${utcData} → ${displayTime}`);
  });
  
  console.log('');
  console.log('✅ Specific scenarios test completed');
};

// Run all tests
export const runAllTimezoneTests = () => {
  testTimezoneConversion();
  testSpecificScenarios();
};