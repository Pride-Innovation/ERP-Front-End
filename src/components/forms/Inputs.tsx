/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import TextField, {
    FilledTextFieldProps,
    OutlinedTextFieldProps,
    StandardTextFieldProps,
    TextFieldVariants
} from '@mui/material/TextField';
import { JSX } from 'react/jsx-runtime';
import MuiPhoneNumber, { MuiPhoneNumberProps } from 'mui-phone-number';
import { IInputForm, IInputPropAdornment } from './interface';
import { IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const PRIMARY_COLOR = '#08796C';

/*
 * Read-only fields (derived values such as Net Value or Depreciation Rate, and figures locked after
 * stocking) are still read, often more than the editable ones. They used to be dimmed with
 * `opacity: 0.7` on top of MUI's own grey disabled text, which left the value barely legible. A
 * read-only field should look *not editable*, not *not there*: a flat tinted background, a lighter
 * border and a not-allowed cursor say that, and the value stays in dark text.
 *
 * `-webkit-text-fill-color` is required — MUI sets it on a disabled input, and `color` alone loses.
 */
export const disabledInputRootSx = {
    backgroundColor: '#EEF1F4',
    cursor: 'not-allowed',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.12)' },
    '& .MuiInputBase-input.Mui-disabled, & .MuiAutocomplete-input.Mui-disabled': {
        color: '#1F2937',
        WebkitTextFillColor: '#1F2937',
        cursor: 'not-allowed',
    },
    '& .MuiSvgIcon-root': { color: 'rgba(0, 0, 0, 0.3)' },
};

export const disabledLabelSx = { color: 'rgba(0, 0, 0, 0.6)' };

export const fieldSx = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        backgroundColor: '#FAFAFA',
        transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: `${PRIMARY_COLOR}80`,
        },
        '&.Mui-focused': {
            backgroundColor: '#fff',
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: PRIMARY_COLOR,
                borderWidth: '1.5px',
                boxShadow: `0 0 0 3px ${PRIMARY_COLOR}18`,
            },
        },
        '&.Mui-disabled': disabledInputRootSx,
        '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: '#D32F2F',
        },
    },
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(0, 0, 0, 0.18)',
    },
    '& .MuiInputLabel-root': {
        color: 'rgba(0, 0, 0, 0.45)',
        fontSize: '0.9375rem',
        '&.Mui-focused': { color: PRIMARY_COLOR },
        '&.Mui-error': { color: '#D32F2F' },
        '&.Mui-disabled': disabledLabelSx,
    },
    '& .MuiInputLabel-outlined:not(.MuiInputLabel-shrink)': {
        transform: 'translate(14px, 13px) scale(1)',
    },
    '& .MuiInputBase-input': {
        padding: '13px 14px',
        fontSize: '0.9375rem',
        lineHeight: 1.5,
    },
};

export const BootstrapInput = (
    props: JSX.IntrinsicAttributes &
    { variant?: TextFieldVariants | undefined; } &
        Omit<FilledTextFieldProps | OutlinedTextFieldProps | StandardTextFieldProps, "variant">) => {
    return <TextField {...props} autoComplete='off' ></TextField>
}

export const BootstrapPhoneNumber = (props: JSX.IntrinsicAttributes & MuiPhoneNumberProps) => (
    <MuiPhoneNumber {...props} defaultCountry={'ug'} />
)

const InputPropAdornment = ({
    handleClick,
    handleMouseDown, optional, position = "end" }: IInputPropAdornment) => (
    <InputAdornment position={position}>
        <IconButton
            aria-label="toggle password visibility"
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            edge={position}
        >
            {optional ? <VisibilityOff /> : <Visibility />}
        </IconButton>
    </InputAdornment>
)

export const InputComponent = ({
    field,
    error,
    label,
    id,
    adornment,
    type = "text",
    handleClick,
    handleMouseDown,
    multiline = false,
    required,
    row = 0,
    disabled = false,
    placeholder,
    helperText
}: IInputForm) => (
    <BootstrapInput
        fullWidth
        multiline={multiline}
        required={required}
        size='medium'
        disabled={disabled}
        rows={row}
        type={type}
        id={id}
        label={label}
        placeholder={placeholder}
        helperText={error ? undefined : helperText}
        variant="outlined"
        {...field}
        error={Boolean(error)}
        sx={fieldSx}
        InputProps={adornment ? {
            endAdornment: (
                <InputPropAdornment handleClick={handleClick} handleMouseDown={handleMouseDown} />
            ),
        } : undefined}
    />
)