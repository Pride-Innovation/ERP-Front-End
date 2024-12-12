import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { IAutocompleteComponent } from './interface';
import { useState, useEffect } from 'react';
import { IOptions } from '../tables/interface';

const AutocompleteComponent = ({
    label,
    field,
    options,
    error,
    multiple = false
}: IAutocompleteComponent) => {
    const [value, setValue] = useState<Array<IOptions>>([]);

    useEffect(() => {
        if (field.value && Array.isArray(field.value)) {
            setValue(options.filter(option => field.value.includes(option.value)));
        }
    }, [field.value, options]);

    const handleChange = (
        _: React.SyntheticEvent<Element, Event>,
        newValue: IOptions | IOptions[] | null
    ) => {
        if (newValue === null) {
            setValue([]);
            field.onChange([]);
        } else {
            const newValueArray = multiple
                ? (newValue as IOptions[]).map(option => option.value)
                : (newValue as IOptions)?.value || null;
            setValue(newValue as Array<IOptions>);
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
            getOptionLabel={(option: IOptions) => option.label}
            size='small'
            fullWidth
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
