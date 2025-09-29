import React, { useEffect, useState } from 'react';
import {
    Box,
    alpha,
    styled,
    Tooltip,
    Paper,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FilterListIcon from '@mui/icons-material/FilterList';

// Styled components for a more compact, header-friendly appearance
const CompactDatePickerWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    '& .MuiInputBase-root': {
        borderRadius: 4,
        backgroundColor: alpha('#fff', 0.9),
        height: 36,
        width: 130,
        fontSize: '0.825rem',
        transition: theme.transitions.create([
            'border-color',
            'background-color',
            'box-shadow',
        ]),
        '&:hover': {
            backgroundColor: '#fff',
            boxShadow: `0 1px 4px ${alpha('#000', 0.07)}`
        },
        '&.Mui-focused': {
            boxShadow: `0 0 0 2px ${alpha('#08796C', 0.25)}`,
            backgroundColor: '#fff',
        }
    },
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: alpha('#000', 0.12),
    },
}));

interface IDateRangePickerProps {
    startDate: Dayjs | null;
    endDate: Dayjs | null;
    onStartDateChange: (date: Dayjs | null) => void;
    onEndDateChange: (date: Dayjs | null) => void;
    startPlaceholder?: string;
    endPlaceholder?: string;
    disabled?: boolean;
    minDate?: Dayjs;
    maxDate?: Dayjs;
    disablePast?: boolean;
    disableFuture?: boolean;
    compact?: boolean;
}

const DateRangePicker: React.FC<IDateRangePickerProps> = ({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    startPlaceholder = "Start date",
    endPlaceholder = "End date",
    disabled = false,
    minDate,
    maxDate,
    disablePast = false,
    disableFuture = false,
    compact = true
}) => {
    // Handle internal date changes
    const handleDateChange = (isStart: boolean, newDate: Dayjs | null) => {
        if (isStart) {
            onStartDateChange(newDate);
            // If start date is after end date, adjust end date
            if (newDate && endDate && newDate.isAfter(endDate)) {
                onEndDateChange(newDate);
            }
        } else {
            onEndDateChange(newDate);
            // If end date is before start date, adjust start date
            if (newDate && startDate && newDate.isBefore(startDate)) {
                onStartDateChange(newDate);
            }
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Paper
                elevation={0}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    py: 0.5,
                    px: 1,
                    borderRadius: 1,
                    backgroundColor: alpha('#f5f5f5', 0.5),
                    border: `1px solid ${alpha('#000', 0.08)}`,
                }}
            >
                <Tooltip title="Date filter">
                    <FilterListIcon
                        fontSize="small"
                        sx={{
                            mr: 1,
                            color: 'primary.main',
                            opacity: 0.7
                        }}
                    />
                </Tooltip>

                <CompactDatePickerWrapper>
                    <DatePicker
                        value={startDate}
                        onChange={(newValue) => handleDateChange(true, newValue)}
                        disabled={disabled}
                        minDate={minDate}
                        maxDate={endDate || maxDate}
                        disablePast={disablePast}
                        disableFuture={disableFuture}
                        format="DD/MM/YYYY"
                        slotProps={{
                            textField: {
                                variant: "outlined",
                                size: "small",
                                placeholder: startPlaceholder,
                                InputProps: {
                                    startAdornment: compact ? undefined : (
                                        <CalendarMonthIcon
                                            sx={{
                                                mr: 0.5,
                                                ml: 0.5,
                                                color: 'primary.main',
                                                fontSize: '0.5rem'
                                            }}
                                        />
                                    ),
                                },
                                sx: {
                                    width: compact ? 130 : 180,
                                    '& .MuiInputBase-input': {
                                        py: 0.75,
                                    }
                                }
                            }
                        }}
                    />

                    <Box
                        component="span"
                        sx={{
                            width: 10,
                            height: 1,
                            bgcolor: 'text.disabled',
                            mx: 0.5
                        }}
                    />

                    <DatePicker
                        value={endDate}
                        onChange={(newValue) => handleDateChange(false, newValue)}
                        disabled={disabled}
                        minDate={startDate || minDate}
                        maxDate={maxDate}
                        disablePast={disablePast}
                        disableFuture={disableFuture}
                        format="DD/MM/YYYY"
                        slotProps={{
                            textField: {
                                variant: "outlined",
                                size: "small",
                                placeholder: endPlaceholder,
                                InputProps: {
                                    startAdornment: compact ? undefined : (
                                        <CalendarMonthIcon
                                            sx={{
                                                mr: 0.5,
                                                ml: 0.5,
                                                color: 'primary.main',
                                                fontSize: '1rem'
                                            }}
                                        />
                                    ),
                                },
                                sx: {
                                    width: compact ? 130 : 180,
                                    '& .MuiInputBase-input': {
                                        py: 0.75,
                                    }
                                }
                            }
                        }}
                    />
                </CompactDatePickerWrapper>
            </Paper>
        </LocalizationProvider>
    );
};

export default DateRangePicker;