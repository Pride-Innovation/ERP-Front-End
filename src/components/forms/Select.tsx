/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState, useEffect } from 'react';
import { alpha, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { ISelectComponent } from './interface';

const PRIMARY_COLOR = '#08796C';

const SelectComponent = ({
    label,
    options,
    required,
    field,
    error,
    id
}: ISelectComponent) => {
    const [option, setOption] = useState<string | undefined>(field?.value || '');

    useEffect(() => {
        setOption(field?.value || '');
    }, [field?.value]);

    const handleChange = (event: SelectChangeEvent<string>) => {
        setOption(event.target.value as string);
        if (field?.onChange) {
            field.onChange(event);
        }
    };

    return (
        <FormControl size='medium' fullWidth sx={{
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
        }}>
            <InputLabel id={id}>{label}</InputLabel>
            <Select
                required={required}
                {...field}
                error={Boolean(error)}
                labelId={id}
                id={id}
                value={option}
                label={label}
                onChange={handleChange}
                MenuProps={{
                    PaperProps: {
                        elevation: 3,
                        sx: {
                            mt: 0.5,
                            borderRadius: '8px',
                            boxShadow: `0 4px 20px ${alpha('#000', 0.1)}`,
                            '& .MuiMenuItem-root': {
                                fontSize: '0.875rem',
                                py: 1,
                                '&:hover': {
                                    backgroundColor: alpha(PRIMARY_COLOR, 0.06),
                                },
                                '&.Mui-selected': {
                                    backgroundColor: alpha(PRIMARY_COLOR, 0.1),
                                    color: PRIMARY_COLOR,
                                    fontWeight: 500,
                                    '&:hover': {
                                        backgroundColor: alpha(PRIMARY_COLOR, 0.14),
                                    },
                                },
                            },
                        },
                    },
                }}
            >
                {options.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

export default SelectComponent;
