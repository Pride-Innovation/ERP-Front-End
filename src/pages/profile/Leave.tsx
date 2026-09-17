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
import { IColleague } from './interface';
import { yupResolver } from '@hookform/resolvers/yup';
import { leaveSchema } from './schema';
import { fetchColleaguesService, submitLeaveApplicationService } from './service';
import { toast } from 'react-toastify';

// Brand colors
const PRIMARY_COLOR = '#08796C';
const SECONDARY_COLOR = '#BC892C';

const selectSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#FAFAFA',
    transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: alpha(PRIMARY_COLOR, 0.5),
    },
    '&.Mui-focused': {
      backgroundColor: '#fff',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: PRIMARY_COLOR,
        borderWidth: '1.5px',
        boxShadow: `0 0 0 3px ${alpha(PRIMARY_COLOR, 0.09)}`,
      },
    },
    '&.Mui-error .MuiOutlinedInput-notchedOutline': {
      borderColor: '#D32F2F',
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(0, 0, 0, 0.18)',
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(0, 0, 0, 0.45)',
    fontSize: '0.875rem',
    '&.Mui-focused': { color: PRIMARY_COLOR },
    '&.Mui-error': { color: '#D32F2F' },
  },
  '& .MuiInputLabel-outlined:not(.MuiInputLabel-shrink)': {
    transform: 'translate(14px, 13px) scale(1)',
  },
  '& .MuiSelect-select.MuiInputBase-input': {
    padding: '13px 32px 13px 14px',
    fontSize: '0.875rem',
    lineHeight: 1.5,
  },
};

const menuPropsStyled = {
  PaperProps: {
    elevation: 3,
    sx: {
      mt: 0.5,
      borderRadius: '8px',
      boxShadow: `0 4px 20px ${alpha('#000', 0.1)}`,
      '& .MuiMenuItem-root': {
        fontSize: '0.875rem',
        py: 1,
        '&:hover': { backgroundColor: alpha(PRIMARY_COLOR, 0.06) },
        '&.Mui-selected': {
          backgroundColor: alpha(PRIMARY_COLOR, 0.1),
          color: PRIMARY_COLOR,
          fontWeight: 500,
          '&:hover': { backgroundColor: alpha(PRIMARY_COLOR, 0.14) },
        },
      },
    },
  },
};

const datePickerSx = {
  width: '100%',
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#FAFAFA',
    transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: alpha(PRIMARY_COLOR, 0.5),
    },
    '&.Mui-focused': {
      backgroundColor: '#fff',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: PRIMARY_COLOR,
        borderWidth: '1.5px',
        boxShadow: `0 0 0 3px ${alpha(PRIMARY_COLOR, 0.09)}`,
      },
    },
    '&.Mui-error .MuiOutlinedInput-notchedOutline': {
      borderColor: '#D32F2F',
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(0, 0, 0, 0.18)',
  },
  '& .MuiOutlinedInput-input': {
    padding: '13px 14px',
    fontSize: '0.875rem',
    lineHeight: 1.5,
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(0, 0, 0, 0.45)',
    fontSize: '0.875rem',
    '&.Mui-focused': { color: PRIMARY_COLOR },
    '&.Mui-error': { color: '#D32F2F' },
  },
  '& .MuiInputLabel-outlined:not(.MuiInputLabel-shrink)': {
    transform: 'translate(14px, 13px) scale(1)',
  },
  '& .MuiInputAdornment-root .MuiIconButton-root': {
    color: 'rgba(0, 0, 0, 0.38)',
    '&:hover': { color: PRIMARY_COLOR, backgroundColor: alpha(PRIMARY_COLOR, 0.06) },
  },
};

const datePickerPopperSx = {
  '& .MuiPaper-root': {
    borderRadius: '12px',
    boxShadow: `0 8px 32px ${alpha('#000', 0.12)}`,
    mt: 0.5,
  },
  '& .MuiPickersDay-root': {
    borderRadius: '8px',
    fontSize: '0.8125rem',
    '&:hover': { backgroundColor: alpha(PRIMARY_COLOR, 0.08) },
    '&.Mui-selected': {
      backgroundColor: PRIMARY_COLOR,
      '&:hover': { backgroundColor: '#065f54' },
      '&:focus': { backgroundColor: PRIMARY_COLOR },
    },
    '&.MuiPickersDay-today': { borderColor: PRIMARY_COLOR },
  },
  '& .MuiPickersCalendarHeader-switchViewButton, & .MuiPickersArrowSwitcher-button': {
    '&:hover': { backgroundColor: alpha(PRIMARY_COLOR, 0.08), color: PRIMARY_COLOR },
  },
  '& .MuiDayCalendar-weekDayLabel': {
    color: alpha(PRIMARY_COLOR, 0.7),
    fontWeight: 600,
    fontSize: '0.75rem',
  },
};

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

const LeaveComponent = ({ handleClose, id }: { handleClose: () => void, id: string }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [isSubmitting, setIsSubmitting] = useState(false);
  /*
    * The colleague list comes from its own endpoint, not from the staff directory.
    *
    * `fetchAllUsers()` here meant `GET /users` — so an officer needed `READ_USER` to go on leave,
    * and only the first ten people in the bank were ever offered (`pageSize=10`).
    */
  const [colleagues, SetColleagues] = useState<IColleague[]>([]);

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

  const onSubmit = async (data: LeaveFormData) => {
    setIsSubmitting(true);
    const leaveData = {
      ...data,
      startDate: startDate?.format('YYYY-MM-DDTHH:mm:ss'),
      endDate: endDate?.format('YYYY-MM-DDTHH:mm:ss') || null,
      actingUser: data.actingPerson
    };

    try {
      const response = await submitLeaveApplicationService(leaveData, id);
      if (response && response.status === 201) {
        reset();
        toast.success('Leave application submitted successfully');
      }
    } catch (error) {
      console.error('Error submitting leave application:', error);
    } finally {
      setIsSubmitting(false);
      handleClose();
    }
  };

  const handleCancel = () => {
    reset();
    handleClose();
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await fetchColleaguesService();
        const people = data?.content ?? [];
        // The server already excludes you and narrows to your own branch, so there is nothing left
        // to filter out here — the old `filter(id !== me)` existed because the directory included
        // everybody.
        if (!cancelled) {
          SetColleagues(people.map((c: {
            id: number; firstName?: string; lastName?: string; email?: string; title?: string;
          }) => ({
            id: c.id,
            name: [c.firstName, c.lastName].filter(Boolean).join(' ').trim() || c.email || `User ${c.id}`,
            role: c.title || 'Employee',
          })));
        }
      } catch (e) {
        // An empty picker is visible in the form; the reason belongs in the console rather than in a
        // toast over a modal the person is still filling in.
        console.warn('Could not load colleagues for the acting-person picker', e);
      }
    })();
    return () => { cancelled = true; };
  }, []);


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
          id="leaveForm"
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
                size="medium"
                sx={{ mb: 2, ...selectSx }}
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
                      MenuProps={menuPropsStyled}
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
                              size: 'medium',
                              fullWidth: true,
                              error: !!errors.startDate,
                              helperText: errors.startDate?.message,
                              sx: datePickerSx,
                            },
                            popper: { sx: datePickerPopperSx },
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
                              size: 'medium',
                              fullWidth: true,
                              error: !!errors.endDate,
                              helperText: errors.endDate?.message,
                              sx: datePickerSx,
                            },
                            popper: { sx: datePickerPopperSx },
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
                size="medium"
                sx={selectSx}
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
                      MenuProps={menuPropsStyled}
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
              form="leaveForm"
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