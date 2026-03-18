import React, { useContext, useEffect, useState } from 'react';
import {
    Box,
    alpha,
    Tooltip,
    Paper,
    Typography,
    Stack,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { FormContext } from '../../context/form';

const PRIMARY_COLOR = '#08796C';

const datePickerSx = {
    width: 138,
    '& .MuiInputBase-root': {
        borderRadius: '6px',
        backgroundColor: alpha(PRIMARY_COLOR, 0.025),
        fontSize: '0.875rem',
        transition: 'all 0.2s ease',
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha(PRIMARY_COLOR, 0.5),
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: PRIMARY_COLOR,
            borderWidth: '1px',
            boxShadow: `0 0 0 2px ${alpha(PRIMARY_COLOR, 0.1)}`,
        },
    },
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: alpha('#000', 0.12),
    },
    '& .MuiInputBase-input': {
        py: '8.5px',
        fontSize: '0.875rem',
    },
    '& .MuiInputAdornment-root .MuiIconButton-root': {
        color: PRIMARY_COLOR,
        padding: '4px',
    },
};

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
    const { tableStartDate, tableEndDate } = useContext(FormContext);

    // Convert Date objects from context to Dayjs objects
    const [startDateValue, setStartDateValue] = useState<Dayjs | null>(
        tableStartDate ? dayjs(tableStartDate) : null
    );
    const [endDateValue, setEndDateValue] = useState<Dayjs | null>(
        tableEndDate ? dayjs(tableEndDate) : null
    );

    // Keep the internal state in sync with context values
    useEffect(() => {
        if (tableStartDate) {
            setStartDateValue(dayjs(tableStartDate));
        }
    }, [tableStartDate]);

    useEffect(() => {
        if (tableEndDate) {
            setEndDateValue(dayjs(tableEndDate));
        }
    }, [tableEndDate]);

    const handleDateChange = (isStart: boolean, newDate: Dayjs | null) => {
        if (isStart) {
            setStartDateValue(newDate);
            onStartDateChange(newDate);
            // If start date is after end date, adjust end date
            if (newDate && endDateValue && newDate.isAfter(endDateValue)) {
                setEndDateValue(newDate);
                onEndDateChange(newDate);
            }
        } else {
            setEndDateValue(newDate);
            onEndDateChange(newDate);
            // If end date is before start date, adjust start date
            if (newDate && startDateValue && newDate.isBefore(startDateValue)) {
                setStartDateValue(newDate);
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
                    gap: 1.5,
                    py: 0.625,
                    px: 1.5,
                    borderRadius: 2,
                    backgroundColor: '#FFFFFF',
                    border: `1px solid ${alpha('#000', 0.12)}`,
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                        borderColor: PRIMARY_COLOR,
                        boxShadow: `0 0 0 2px ${alpha(PRIMARY_COLOR, 0.1)}`,
                    },
                }}
            >
                {/* Icon + Label */}
                <Tooltip title="Filter by date range">
                    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flexShrink: 0 }}>
                        <Box sx={{
                            width: 28, height: 28,
                            borderRadius: 1,
                            bgcolor: alpha(PRIMARY_COLOR, 0.1),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <CalendarMonthIcon sx={{ fontSize: 15, color: PRIMARY_COLOR }} />
                        </Box>
                        <Typography variant="caption" fontWeight={600} sx={{ color: PRIMARY_COLOR }}>
                            Date Range
                        </Typography>
                    </Stack>
                </Tooltip>

                {/* Vertical divider */}
                <Box sx={{ width: '1px', height: 26, bgcolor: alpha(PRIMARY_COLOR, 0.2), flexShrink: 0 }} />

                {/* Start date */}
                <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ flexShrink: 0 }}>
                        From
                    </Typography>
                    <DatePicker
                        value={startDateValue}
                        onChange={(newValue) => handleDateChange(true, newValue)}
                        disabled={disabled}
                        minDate={minDate}
                        maxDate={endDateValue || maxDate}
                        disablePast={disablePast}
                        disableFuture={disableFuture}
                        format="DD/MM/YYYY"
                        slotProps={{
                            textField: {
                                variant: "outlined",
                                size: "small",
                                placeholder: startPlaceholder,
                                sx: datePickerSx,
                            }
                        }}
                    />
                </Stack>

                {/* Arrow separator */}
                <ArrowRightAltIcon sx={{ fontSize: 20, color: alpha(PRIMARY_COLOR, 0.45), flexShrink: 0 }} />

                {/* End date */}
                <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ flexShrink: 0 }}>
                        To
                    </Typography>
                    <DatePicker
                        value={endDateValue}
                        onChange={(newValue) => handleDateChange(false, newValue)}
                        disabled={disabled}
                        minDate={startDateValue || minDate}
                        maxDate={maxDate}
                        disablePast={disablePast}
                        disableFuture={disableFuture}
                        format="DD/MM/YYYY"
                        slotProps={{
                            textField: {
                                variant: "outlined",
                                size: "small",
                                placeholder: endPlaceholder,
                                sx: datePickerSx,
                            }
                        }}
                    />
                </Stack>
            </Paper>
        </LocalizationProvider>
    );
};

export default DateRangePicker;