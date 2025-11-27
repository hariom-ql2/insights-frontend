import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { addMinutes } from 'date-fns';
import ScheduleScheduler from '../components/ScheduleScheduler';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const TimeZoneDemo: React.FC = () => {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState<any>(null);

  const handleSchedule = (data: any) => {
    setScheduleData(data);
    setScheduleOpen(false);
  };

  const resetSchedule = () => {
    setScheduleData(null);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 3 }}>
          <AccessTimeIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1" fontWeight={600}>
            Schedule Scheduler Demo
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Experience the new comprehensive scheduling system with multiple schedule types
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => setScheduleOpen(true)}
            sx={{ minWidth: 200 }}
          >
            Open Schedule Scheduler
          </Button>
        </Box>

        {scheduleData && (
          <Paper sx={{ p: 3, backgroundColor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
            <Typography variant="h6" color="success.main" sx={{ mb: 2 }}>
              ✅ Schedule Created
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Schedule Type:</strong> {scheduleData.schedule_type}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Schedule Data:</strong> {JSON.stringify(scheduleData.schedule_data, null, 2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This data will be sent to the backend for processing
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={resetSchedule}
              sx={{ mt: 2 }}
            >
              Reset
            </Button>
          </Paper>
        )}

        <Box sx={{ mt: 4, textAlign: 'left' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Features Demonstrated:
          </Typography>
          <ul>
            <li>🕐 <strong>Once</strong> - Schedule for a specific date and time</li>
            <li>📅 <strong>Daily</strong> - Run every day at the same time</li>
            <li>📆 <strong>Weekly</strong> - Run every week on the same day</li>
            <li>🔄 <strong>Biweekly</strong> - Run every other week</li>
            <li>📊 <strong>Monthly</strong> - Run monthly on the same day</li>
            <li>🌍 <strong>Timezone Support</strong> - Respects user's timezone settings</li>
            <li>👀 <strong>Real-time Preview</strong> - Shows schedule configuration</li>
            <li>✅ <strong>Validation</strong> - Ensures proper schedule configuration</li>
          </ul>
        </Box>
      </Paper>

      <ScheduleScheduler
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        onSchedule={handleSchedule}
        initialDate={addMinutes(new Date(), 30)}
      />
    </Container>
  );
};

export default TimeZoneDemo;
