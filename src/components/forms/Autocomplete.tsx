import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { IAutocompleteComponent } from './interface';

const AutocompleteComponent = ({
    label,
    field,
    options,
    error,
}: IAutocompleteComponent) => {
    return (
        <Autocomplete
            disablePortal
            options={options}
            size='small'
            fullWidth
            renderInput={(params) =>
                <TextField
                    required={true}
                    {...params}
                    {...field}
                    label={label}
                    error={Boolean(error)}
                />}
        />
    )
}

export default AutocompleteComponent