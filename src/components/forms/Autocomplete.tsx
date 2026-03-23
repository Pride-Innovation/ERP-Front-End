/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Paper from '@mui/material/Paper';
import { IAutocompleteComponent } from './interface';
import { useEffect, useContext, useState } from 'react';
import { IOptions } from '../tables/interface';
import { useDebounce } from '../../hooks/useDebounce';
import { AutocompleteContext } from '../../context/autocomplete';
import { alpha, Popper } from '@mui/material';

export const PRIMARY_COLOR = '#08796C';

export const autocompleteSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        backgroundColor: '#FAFAFA',
        // Only zero out vertical padding with !important — do NOT touch horizontal
        // (MUI sets paddingRight separately for the popup icon area; shorthand would break it)
        paddingTop: '0px !important',
        paddingBottom: '0px !important',
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
        '&.Mui-disabled': {
            backgroundColor: '#F3F4F6',
            opacity: 0.7,
        },
        '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: '#D32F2F',
        },
        // MUI nested rule has higher specificity — !important is required here too
        '& .MuiAutocomplete-input': {
            padding: '13px 4px !important',
            fontSize: '0.875rem',
            lineHeight: 1.5,
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
    // root vertical = 0, inner vertical = 13px → same total as Input/Select (13px per side)
    '& .MuiInputLabel-outlined:not(.MuiInputLabel-shrink)': {
        transform: 'translate(14px, 13px) scale(1)',
    },
    '& .MuiChip-root': {
        height: 24,
        fontSize: '0.8rem',
        backgroundColor: alpha(PRIMARY_COLOR, 0.08),
        color: PRIMARY_COLOR,
        '& .MuiChip-deleteIcon': {
            color: alpha(PRIMARY_COLOR, 0.5),
            '&:hover': { color: PRIMARY_COLOR },
        },
    },
};

/**
 * AutocompleteComponent
 * 
 * A reusable Autocomplete input field with optional async search capability.
 * 
 * @param label - The label for the input field.
 * @param field - React Hook Form field binding object.
 * @param options - List of selectable options.
 * @param error - Validation error from React Hook Form.
 * @param multiple - Whether multiple selections are allowed.
 */

const AutocompleteComponent = ({
    label,
    field,
    options,
    error,
    multiple = false,
    name,
    disabled = false
}: IAutocompleteComponent) => {
    const [selectedValue, setSelectedValue] = useState<IOptions | IOptions[] | null>(null);
    const [localInput, setLocalInput] = useState('');
    const debouncedInput = useDebounce(localInput, 500);

    const { setValue: setGlobalValue, setInputValue, setSelectedItemDetails, setLabel } = useContext(AutocompleteContext);

    // Sync debounced input value to context for filtering/searching
    useEffect(() => {
        setInputValue(debouncedInput);
        setLabel(label)
    }, [debouncedInput, setInputValue]);

    // Sync form value to Autocomplete's local state
    useEffect(() => {
        if (!field?.value || options.length === 0) {
            setSelectedValue(multiple ? [] : null);
            return;
        }

        if (multiple && Array.isArray(field.value)) {
            const matchedOptions = options.filter(option => field.value.includes(option.value));
            setSelectedValue(matchedOptions);
        } else {
            const matchedOption = options.find(option => option.value === field.value);
            setSelectedValue(matchedOption ?? null);
        }
    }, [field.value, options, multiple]);

    // Handle selection changes
    const handleChange = (
        _: React.SyntheticEvent<Element, Event>,
        newValue: IOptions | IOptions[] | null
    ) => {
        setSelectedValue(newValue);

        // Only set global context value when it's single selection
        if (!multiple && newValue) {
            setGlobalValue(newValue as IOptions);
            setSelectedItemDetails({ item: name as string, id: (newValue as IOptions).value as number });
        }

        if (newValue === null || (Array.isArray(newValue) && newValue.length === 0)) {
            field.onChange(multiple ? [] : null);
        } else {
            const newValueToSet = multiple
                ? (newValue as IOptions[]).map(option => option.value)
                : (newValue as IOptions).value;

            field.onChange(newValueToSet);
        }
    };

    // Custom Popper: z-index 1500 ensures dropdown appears above Modals (z-index 1300)
    const CustomPopper = (props: any) => (
        <Popper
            {...props}
            placement="bottom-start"
            style={{ ...props.style, zIndex: 1500 }}
            modifiers={[
                { name: 'preventOverflow', options: { altBoundary: true, rootBoundary: 'document', padding: 8 } },
                { name: 'flip', options: { altBoundary: true, rootBoundary: 'document', padding: 8 } },
            ]}
        />
    );

    const CustomPaper = ({ children, ...props }: any) => (
        <Paper
            {...props}
            elevation={4}
            sx={{
                mt: 0.5,
                borderRadius: '8px',
                boxShadow: `0 4px 24px ${alpha('#000', 0.12)}`,
                '& .MuiAutocomplete-listbox': {
                    padding: '4px 0',
                    '& .MuiAutocomplete-option': {
                        fontSize: '0.875rem',
                        minHeight: 40,
                        px: 2,
                        '&:hover': { backgroundColor: alpha(PRIMARY_COLOR, 0.06) },
                        '&[aria-selected="true"]': {
                            backgroundColor: alpha(PRIMARY_COLOR, 0.1),
                            color: PRIMARY_COLOR,
                            fontWeight: 500,
                        },
                        '&[aria-selected="true"]:hover': {
                            backgroundColor: alpha(PRIMARY_COLOR, 0.14),
                        },
                        '&.Mui-focused': {
                            backgroundColor: alpha(PRIMARY_COLOR, 0.06),
                        },
                    },
                },
            }}
        >
            {children}
        </Paper>
    );

    return (
        <Autocomplete
            value={selectedValue}
            multiple={multiple}
            disablePortal={false}
            onChange={handleChange}
            options={options}
            getOptionLabel={(option: IOptions) => option.label || ''}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            size="medium"
            disabled={disabled}
            fullWidth
            PopperComponent={CustomPopper}
            PaperComponent={CustomPaper}
            onInputChange={(_, newInputValue) => setLocalInput(newInputValue)}
            sx={{
                '& .MuiAutocomplete-popupIndicator': { color: alpha(PRIMARY_COLOR, 0.6) },
                '& .MuiAutocomplete-clearIndicator': { color: alpha(PRIMARY_COLOR, 0.5) },
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    error={Boolean(error)}
                    helperText={error?.message}
                    disabled={disabled}
                    sx={autocompleteSx}
                />
            )}
        />
    );
};

export default AutocompleteComponent;

