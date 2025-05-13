/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { IAutocompleteComponent } from './interface';
import { useEffect, useContext } from 'react';
import { IOptions } from '../tables/interface';
import { useDebounce } from '../../hooks/useDebounce';
import { AutocompleteContext } from '../../context/autocomplete';

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
 * @param fetchOptions - Optional async function to fetch options based on input (debounced).
 */

const AutocompleteComponent = ({
    label,
    field,
    options,
    error,
    multiple = false,
    fetchOptions
}: IAutocompleteComponent) => {
    const { value, inputValue, setInputValue, setValue } = useContext(AutocompleteContext)

    const debouncedValue = useDebounce(inputValue, 500);

    useEffect(() => {
        if (!options.length) {
            fetchOptions?.("");
        }
    }, [options, fetchOptions]);

    useEffect(() => {
        if (debouncedValue) {
            fetchOptions?.(debouncedValue);
        }
    }, [debouncedValue, fetchOptions]);

    const handleChange = (
        _: React.SyntheticEvent<Element, Event>,
        newValue: IOptions | IOptions[] | null
    ) => {
        if (newValue === null) {
            setValue(null);
            field.onChange([]);
        } else {
            const newValueArray = multiple
                ? (newValue as IOptions[]).map(option => option.value)
                : (newValue as IOptions)?.value;
            setValue(newValue as IOptions);
            field.onChange(newValueArray);
        }
    };

    return (
        <Autocomplete
            value={value}
            multiple={multiple}
            disablePortal
            onChange={handleChange}
            options={options}
            getOptionLabel={(option: IOptions) => option.label || ""}
            size='small'
            fullWidth
            onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
            renderInput={(params) => (
                <TextField
                    {...params}
                    {...field}
                    label={label}
                    error={Boolean(error)}
                    helperText={error?.message}
                />
            )}
        />
    );
};

export default AutocompleteComponent;
