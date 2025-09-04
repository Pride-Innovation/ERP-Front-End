/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Stack,
  Button,
  alpha,
  useTheme,
  useMediaQuery,
  Tooltip,
  CircularProgress,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useForm, Controller, Resolver } from 'react-hook-form';

// Icons
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import PersonIcon from '@mui/icons-material/Person';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import dayjs, { Dayjs } from 'dayjs';
import UserUtils from '../users/utils';
import { IColleague } from './interface';
import { useSelector } from 'react-redux';
import { IUser } from '../users/interface';
import { yupResolver } from '@hookform/resolvers/yup';
import { leaveSchema } from './schema';

// Brand colors
const PRIMARY_COLOR = '#08796C';
const SECONDARY_COLOR = '#BC892C';

// Leave types options
const leaveTypes = [
  { value: 'annual', label: 'Annual Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'study', label: 'Study Leave' },
  { value: 'maternity', label: 'Maternity Leave' },
  { value: 'paternity', label: 'Paternity Leave' },
  { value: 'bereavement', label: 'Bereavement Leave' },
  { value: 'unpaid', label: 'Unpaid Leave' }
];

// Updated interface to use Dayjs instead of Date
interface LeaveFormData {
  leaveType: string;
  startDate?: Dayjs | null;
  endDate?: Dayjs | null;
  actingPerson: number;
  reason?: string;
}

const LeaveComponent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { fetchAllUsers } = UserUtils();
  const [colleagues, SetColleagues] = useState<IColleague[]>([] as Array<IColleague>); // Replace with fetched users
  const { users } = useSelector((state: any) => state.UserStore);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm<LeaveFormData>({
    resolver: yupResolver(leaveSchema) as Resolver<LeaveFormData>,
    defaultValues: {
      leaveType: '',
      startDate: null,
      endDate: null,
      actingPerson: 1,
      reason: ''
    }
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const calculateLeaveDays = () => {
    if (!startDate || !endDate) return 0;

    let count = 0;
    const current = dayjs(startDate);
    const end = dayjs(endDate);

    let currentDay = current.clone();

    while (currentDay.isBefore(end) || currentDay.isSame(end, 'day')) {
      const dayOfWeek = currentDay.day();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      currentDay = currentDay.add(1, 'day');
    }

    return count;
  };

  const leaveDays = calculateLeaveDays();

  const onSubmit = (data: LeaveFormData) => {
    setIsSubmitting(true);
    console.log(data, "Leave form data");
  };

  const handleCancel = () => {
    reset();
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const handleColleagues = async () => {
    const data: Array<IColleague> = users.map((user: IUser) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      role: user.title?.name || 'Employee'
    }));
    SetColleagues(data);
  }

  useEffect(() => {
    if (users.length > 0) {
      handleColleagues();
    }
  }, [users]);


  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          border: `1px solid ${alpha('#000', 0.08)}`,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            bgcolor: alpha(PRIMARY_COLOR, 0.03),
            borderBottom: `1px solid ${alpha('#000', 0.08)}`,
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0
          }}
        >
          <Box
            sx={{
              bgcolor: alpha(PRIMARY_COLOR, 0.12),
              color: PRIMARY_COLOR,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1.5,
              mr: 2,
              flexShrink: 0
            }}
          >
            <EventAvailableIcon fontSize="small" />
          </Box>

          <Box>
            <Typography
              variant={isMobile ? "subtitle1" : "h6"}
              sx={{
                color: 'text.primary',
                fontWeight: 600,
                mb: 0.5
              }}
            >
              Request Leave
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
              Submit your leave request and assign someone to act in your absence
            </Typography>
          </Box>
        </Box>

        {/* Form Content - Scrollable if needed */}
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            p: { xs: 2, sm: 2.5 },
            overflow: 'auto',
            flexGrow: 1
          }}
        >
          <Grid container spacing={2.5}>
            {/* Left Column */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                <EventBusyIcon fontSize="small" sx={{ color: alpha(PRIMARY_COLOR, 0.8), mr: 1 }} />
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary'
                  }}
                >
                  Leave
                </Typography>
              </Box>

              {/* Leave Type */}
              <FormControl
                fullWidth
                error={!!errors.leaveType}
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
              >
                <InputLabel id="leave-type-label">Leave Type</InputLabel>
                <Controller
                  name="leaveType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="leave-type-label"
                      label="Leave Type"
                    >
                      {leaveTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.leaveType && (
                  <FormHelperText>{errors.leaveType.message}</FormHelperText>
                )}
              </FormControl>

              {/* Date Range in a more compact layout */}
              <Box sx={{ mb: 2 }}>
                <Grid container spacing={2}>
                  {/* Start Date */}
                  <Grid item xs={6}>
                    <Controller
                      name="startDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          label="Start Date"
                          value={field.value}
                          onChange={(date) => field.onChange(date)}
                          slotProps={{
                            textField: {
                              size: "small",
                              fullWidth: true,
                              error: !!errors.startDate,
                              helperText: errors.startDate?.message,
                            }
                          }}
                          disablePast
                        />
                      )}
                    />
                  </Grid>

                  {/* End Date */}
                  <Grid item xs={6}>
                    <Controller
                      name="endDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          label="End Date"
                          value={field.value}
                          onChange={(date) => field.onChange(date)}
                          slotProps={{
                            textField: {
                              size: "small",
                              fullWidth: true,
                              error: !!errors.endDate,
                              helperText: errors.endDate?.message,
                            }
                          }}
                          disablePast
                          minDate={startDate || undefined}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Leave Day Summary - Shows only when dates are selected */}
              {startDate && endDate && leaveDays > 0 && (
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: alpha(SECONDARY_COLOR, 0.05),
                    borderRadius: 1.5,
                    border: `1px solid ${alpha(SECONDARY_COLOR, 0.2)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InfoOutlinedIcon sx={{ color: SECONDARY_COLOR, fontSize: '1.1rem' }} />
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                      <strong>{leaveDays} working day{leaveDays !== 1 ? 's' : ''}</strong> of leave
                    </Typography>
                  </Box>
                  <Tooltip title="Weekend days are automatically excluded">
                    <Typography
                      variant="caption"
                      sx={{
                        color: SECONDARY_COLOR,
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Details
                    </Typography>
                  </Tooltip>
                </Box>
              )}
            </Grid>

            {/* Right Column - Acting Person Only */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center' }}>
                <PersonIcon fontSize="small" sx={{ color: alpha(PRIMARY_COLOR, 0.8), mr: 1 }} />
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary'
                  }}
                >
                  Acting Arrangement
                </Typography>
              </Box>

              {/* Acting Person */}
              <FormControl
                fullWidth
                error={!!errors.actingPerson}
                variant="outlined"
                size="small"
              >
                <InputLabel id="acting-person-label">Acting Person</InputLabel>
                <Controller
                  name="actingPerson"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      labelId="acting-person-label"
                      label="Acting Person"
                      startAdornment={<PersonIcon sx={{ ml: 0.5, mr: 0.5, color: alpha('#000', 0.4), fontSize: '1.2rem' }} />}
                    >
                      {colleagues.map((colleague) => (
                        <MenuItem key={colleague.id} value={colleague.id}>
                          <Stack>
                            <Typography variant="body2">{colleague.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {colleague.role}
                            </Typography>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.actingPerson && (
                  <FormHelperText>{errors.actingPerson.message}</FormHelperText>
                )}
              </FormControl>

              {/* Additional information about acting arrangements */}
              <Box
                sx={{
                  mt: 2,
                  p: 1.5,
                  bgcolor: alpha(PRIMARY_COLOR, 0.03),
                  borderRadius: 1.5,
                  border: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  The selected person will be notified and will handle your responsibilities during your absence.
                </Typography>
              </Box>
            </Grid>

            {/* Divider */}
            <Grid item xs={12}>
              <Divider sx={{ my: 0.5 }} />
            </Grid>

            {/* Optional Reason Field - Now Full Width */}
            <Grid item xs={12}>
              <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <NoteAddIcon fontSize="small" sx={{ color: alpha(PRIMARY_COLOR, 0.8), mr: 1 }} />
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary'
                    }}
                  >
                    Reason for Leave
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Optional
                </Typography>
              </Box>

              <Controller
                name="reason"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    placeholder="Please provide details about your leave request (optional)"
                    fullWidth
                    multiline
                    rows={isMobile ? 2 : 3}
                    variant="outlined"
                    size="small"
                    error={!!errors.reason}
                    helperText={errors.reason?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Form Actions - Fixed at bottom */}
        <Box
          sx={{
            p: { xs: 2, sm: 2 },
            borderTop: `1px solid ${alpha('#000', 0.08)}`,
            bgcolor: alpha('#f5f5f5', 0.5),
            display: 'flex',
            justifyContent: 'flex-end',
            flexShrink: 0
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <Button
              variant="outlined"
              onClick={handleCancel}
              disabled={isSubmitting}
              sx={{
                borderColor: alpha('#000', 0.2),
                color: 'text.secondary',
                '&:hover': {
                  borderColor: alpha('#000', 0.3),
                  bgcolor: alpha('#000', 0.05)
                },
                order: { xs: 2, sm: 1 }
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
              sx={{
                bgcolor: PRIMARY_COLOR,
                '&:hover': {
                  bgcolor: alpha(PRIMARY_COLOR, 0.9)
                },
                order: { xs: 1, sm: 2 }
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
}

export default LeaveComponent;