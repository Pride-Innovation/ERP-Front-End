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
    row = 0
}: IInputForm) => (
    <BootstrapInput
        multiline={multiline}
        required={required}
        size='small'
        rows={row}
        type={type}
        id={id}
        label={label}
        variant="outlined"
        {...field}
        error={Boolean(error)}
        InputProps={adornment ? {
            endAdornment: (
                <InputPropAdornment handleClick={handleClick} handleMouseDown={handleMouseDown} />
            ),
        } : undefined}
    />
)