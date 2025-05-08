/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    FormControl,
    FormHelperText,
    Grid,
} from '@mui/material';
import { Controller } from 'react-hook-form';
import { InputComponent } from '../../../components/forms/Inputs';
import ButtonComponent from '../../../components/forms/Button';
import { LinkComponent } from '../../../components/headers/TypographyComponent';
import { IAuthenticationForm } from '../interface';

const AuthenticationForm = ({
    formState,
    control,
    buttonText,
    showPassword,
    loggingIn,
    handleClickShowPassword,
    handleMouseDownPassword,
    linkText,
    linkPath,
    password,
}: IAuthenticationForm) => {
    return (
        <Grid container spacing={4}>
            <Grid item xs={12}>
                <FormControl fullWidth>
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <InputComponent
                                required
                                label="Email Address"
                                field={field}
                                error={formState.errors.email}
                                id="email"
                                type="email"
                            />
                        )}
                    />
                    {formState.errors.email && (
                        <FormHelperText error>
                            {formState.errors.email.message}
                        </FormHelperText>
                    )}
                </FormControl>
            </Grid>

            {password && (
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <Controller
                            name="password"
                            control={control}
                            render={({ field }) => (
                                <InputComponent
                                    required
                                    label="Password"
                                    field={field}
                                    error={formState.errors.password}
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    handleClick={handleClickShowPassword}
                                    handleMouseDown={handleMouseDownPassword}
                                    adornment
                                />
                            )}
                        />
                        {formState.errors.password && (
                            <FormHelperText error>
                                {formState.errors.password.message}
                            </FormHelperText>
                        )}
                    </FormControl>
                </Grid>
            )}

            <Grid item xs={12}>
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        pb: 2,
                    }}
                >
                    <LinkComponent
                        href={linkPath}
                        size="15px"
                        weight={400}
                        text={linkText}
                    />
                </Box>
                <ButtonComponent
                    type="submit"
                    sendingRequest={loggingIn}
                    buttonText={buttonText}
                    buttonColor="success"
                />
            </Grid>
        </Grid>
    );
};

export default AuthenticationForm;
