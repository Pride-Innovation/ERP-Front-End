import {
    Box,
    FormControl,
    FormHelperText,
    Grid
} from '@mui/material'
import {
    Control,
    Controller,
    FieldError,
    FormState,
    UseFormRegister
} from 'react-hook-form'
import { InputComponent } from '../../../components/forms/Inputs'
import { ILogin } from '../interface';
import ButtonComponent from '../../../components/forms/Button';
import { LinkComponent } from '../../../components/headers/TypographyComponent';

interface IAuthenticationForm {
    formState: FormState<ILogin> & {
        errors: {
            email?: FieldError;
            password?: FieldError;
        };
    };
    control: Control<ILogin>;
    register: UseFormRegister<ILogin>;
    buttonText: string;
    showPassword: boolean;
    loggingIn: boolean;
    handleMouseDownPassword: (event: React.MouseEvent<HTMLButtonElement>) => void;
    handleClickShowPassword: () => void;
    linkText?: string
    linkPath: string
    password?: boolean
}

const AuthenticationForm = ({
    formState,
    control,
    register,
    buttonText,
    showPassword,
    loggingIn,
    handleClickShowPassword,
    handleMouseDownPassword,
    linkText,
    linkPath,
    password
}: IAuthenticationForm) => {
    return (
        <Grid item container xs={12}
        >
            <Grid item container spacing={3} xs={12}>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <Controller
                            control={control}
                            {...register("email")}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <InputComponent required label='Email Address' field={field} error={formState.errors.email} id='email' />
                            )}
                        />
                        {formState.errors.email && (
                            <FormHelperText sx={{ color: 'error.main' }}>{formState.errors.email.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>
                {password && <Grid item xs={12}>
                    <FormControl fullWidth>
                        <Controller
                            control={control}
                            {...register("password")}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <InputComponent
                                    required
                                    handleClick={handleClickShowPassword}
                                    handleMouseDown={handleMouseDownPassword}
                                    label='Password'
                                    field={field}
                                    error={formState.errors.password}
                                    id='password'
                                    type={showPassword ? 'text' : 'password'}
                                    adornment />
                            )}
                        />
                        {formState.errors.password && (
                            <FormHelperText sx={{ color: 'error.main' }}>{formState.errors.password.message}</FormHelperText>
                        )}
                    </FormControl>
                </Grid>}
                <Grid item xs={12}>
                    <Box sx={{ width: "100%", pb: '10px' }}>
                        <LinkComponent href={linkPath} size='17px' weight={400} text={linkText} />
                    </Box>
                    <ButtonComponent buttonColor='success' type='submit' sendingRequest={loggingIn} buttonText={buttonText} />
                </Grid>
            </Grid>
        </Grid>
    )
}

export default AuthenticationForm;