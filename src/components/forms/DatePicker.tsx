/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { IDatePickerComponent } from './interface';
import { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { alpha } from '@mui/material';

const PRIMARY_COLOR = '#08796C';

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
    // Calendar icon — teal on hover/focus
    '& .MuiInputAdornment-root .MuiIconButton-root': {
        color: 'rgba(0, 0, 0, 0.38)',
        '&:hover': { color: PRIMARY_COLOR, backgroundColor: alpha(PRIMARY_COLOR, 0.06) },
    },
};

const DatePickerComponent = ({ label, field, error }: IDatePickerComponent) => {
    const [parsedValue, setParsedValue] = useState<Dayjs | null>(null);

    useEffect(() => {
        if (field.value) {
            setParsedValue(dayjs(field.value));
        } else {
            setParsedValue(null);
        }
    }, [field.value]);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
                format='DD-MM-YYYY'
                label={label}
                value={parsedValue}
                onChange={(newValue) => {
                    field.onChange(newValue ? newValue.format('YYYY-MM-DD') : null);
                    setParsedValue(newValue);
                }}
                slotProps={{
                    textField: {
                        size: 'medium',
                        fullWidth: true,
                        error: Boolean(error),
                        required: true,
                        sx: datePickerSx,
                    },
                    popper: {
                        sx: {
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
                                '&.MuiPickersDay-today': {
                                    borderColor: PRIMARY_COLOR,
                                },
                            },
                            '& .MuiPickersCalendarHeader-switchViewButton, & .MuiPickersArrowSwitcher-button': {
                                '&:hover': { backgroundColor: alpha(PRIMARY_COLOR, 0.08), color: PRIMARY_COLOR },
                            },
                            '& .MuiDayCalendar-weekDayLabel': {
                                color: alpha(PRIMARY_COLOR, 0.7),
                                fontWeight: 600,
                                fontSize: '0.75rem',
                            },
                        },
                    },
                }}
            />
        </LocalizationProvider>
    );
};

export default DatePickerComponent;