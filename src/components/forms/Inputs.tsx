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
    required
}: IInputForm) => (
    <BootstrapInput
        required={required}
        size='small'
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