/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { IAutocompleteComponent } from './interface';
import { useEffect, useContext, useState } from 'react';
import { IOptions } from '../tables/interface';
import { useDebounce } from '../../hooks/useDebounce';
import { AutocompleteContext } from '../../context/autocomplete';
import { Popper } from '@mui/material';

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

    // Custom Popper for proper positioning of dropdown
    const CustomPopper = (props: any) => {
        return (
            <Popper
                {...props}
                placement="bottom-start"
                modifiers={[
                    {
                        name: 'preventOverflow',
                        options: {
                            altBoundary: true,
                            rootBoundary: 'document',
                            padding: 8,
                        },
                    },
                    {
                        name: 'flip',
                        options: {
                            altBoundary: true,
                            rootBoundary: 'document',
                            padding: 8,
                        },
                    }
                ]}
                style={{ zIndex: 1300, ...props.style }}
            />
        );
    };

    return (
        <Autocomplete
            value={selectedValue}
            multiple={multiple}
            disablePortal={false} // Keep dropdown within the DOM hierarchy
            onChange={handleChange}
            options={options}
            getOptionLabel={(option: IOptions) => option.label || ''}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            size="small"
            disabled={disabled}
            fullWidth
            PopperComponent={CustomPopper} // Use custom Popper for better control
            onInputChange={(_, newInputValue) => setLocalInput(newInputValue)}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    error={Boolean(error)}
                    helperText={error?.message}
                    disabled={disabled}
                />
            )}
        />
    );
};

export default AutocompleteComponent;

