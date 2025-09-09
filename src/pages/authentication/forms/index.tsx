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
    InputAdornment,
    TextField,
    Typography,
    alpha,
    IconButton,
    Button,
    Link,
    useTheme,
    CircularProgress,
    Fade
} from '@mui/material';
import { Controller } from 'react-hook-form';
import { IAuthenticationForm } from '../interface';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useState } from 'react';

// Brand colors
const PRIMARY_COLOR = '#08796C';
const GOLD_COLOR = '#BC892C';

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
    const theme = useTheme();
    const [focusedField, setFocusedField] = useState<string | null>(null);

    // Determine if form has any errors
    const hasErrors = Object.keys(formState.errors).length > 0;

    return (
        <Grid container spacing={2.5}>
            {/* Email field */}
            <Grid item xs={12}>
                <FormControl fullWidth variant="outlined">
                    <Typography
                        variant="body2"
                        sx={{
                            mb: 0.75,
                            ml: 0.5,
                            fontWeight: 500,
                            color: focusedField === 'email' ? PRIMARY_COLOR : 'text.secondary',
                            transition: 'color 0.2s ease-in-out'
                        }}
                    >
                        Email Address
                    </Typography>
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                fullWidth
                                id="email"
                                type="email"
                                variant="outlined"
                                error={!!formState.errors.email}
                                placeholder="Enter your email address"
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailOutlinedIcon
                                                sx={{
                                                    color: formState.errors.email
                                                        ? theme.palette.error.main
                                                        : focusedField === 'email'
                                                            ? PRIMARY_COLOR
                                                            : 'text.secondary',
                                                    opacity: focusedField === 'email' ? 1 : 0.7,
                                                    transition: 'all 0.2s ease'
                                                }}
                                            />
                                        </InputAdornment>
                                    ),
                                    sx: {
                                        borderRadius: 2,
                                        bgcolor: '#fff',
                                        '&.Mui-focused': {
                                            boxShadow: `0 0 0 3px ${alpha(PRIMARY_COLOR, 0.15)}`,
                                        },
                                        transition: 'all 0.3s ease-in-out',
                                        pr: 1,
                                        height: 52
                                    }
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: formState.errors.email
                                            ? theme.palette.error.main
                                            : focusedField === 'email'
                                                ? PRIMARY_COLOR
                                                : alpha('#000', 0.15),
                                        borderWidth: formState.errors.email || focusedField === 'email' ? 1.5 : 1,
                                        transition: 'all 0.2s ease'
                                    },
                                }}
                            />
                        )}
                    />
                    <Fade in={!!formState.errors.email}>
                        <FormHelperText error sx={{ mx: 0.5, mt: 0.75, fontWeight: 500, height: 20 }}>
                            {formState.errors.email?.message || ' '}
                        </FormHelperText>
                    </Fade>
                </FormControl>
            </Grid>

            {/* Password field */}
            {password && (
                <Grid item xs={12}>
                    <FormControl fullWidth variant="outlined">
                        <Typography
                            variant="body2"
                            sx={{
                                mb: 0.75,
                                ml: 0.5,
                                fontWeight: 500,
                                color: focusedField === 'password' ? PRIMARY_COLOR : 'text.secondary',
                                transition: 'color 0.2s ease-in-out'
                            }}
                        >
                            Password
                        </Typography>
                        <Controller
                            name="password"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    fullWidth
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    variant="outlined"
                                    error={!!formState.errors.password}
                                    placeholder="Enter your password"
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockOutlinedIcon
                                                    sx={{
                                                        color: formState.errors.password
                                                            ? theme.palette.error.main
                                                            : focusedField === 'password'
                                                                ? PRIMARY_COLOR
                                                                : 'text.secondary',
                                                        opacity: focusedField === 'password' ? 1 : 0.7,
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleClickShowPassword}
                                                    onMouseDown={handleMouseDownPassword}
                                                    edge="end"
                                                    sx={{
                                                        color: focusedField === 'password' ? PRIMARY_COLOR : 'text.secondary',
                                                        opacity: focusedField === 'password' ? 0.9 : 0.7,
                                                        '&:hover': {
                                                            backgroundColor: alpha('#000', 0.04),
                                                            opacity: 1
                                                        },
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    {showPassword ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: {
                                            borderRadius: 2,
                                            bgcolor: '#fff',
                                            '&.Mui-focused': {
                                                boxShadow: `0 0 0 3px ${alpha(PRIMARY_COLOR, 0.15)}`,
                                            },
                                            transition: 'all 0.3s ease-in-out',
                                            height: 52
                                        }
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: formState.errors.password
                                                ? theme.palette.error.main
                                                : focusedField === 'password'
                                                    ? PRIMARY_COLOR
                                                    : alpha('#000', 0.15),
                                            borderWidth: formState.errors.password || focusedField === 'password' ? 1.5 : 1,
                                            transition: 'all 0.2s ease'
                                        },
                                    }}
                                />
                            )}
                        />
                        <Fade in={!!formState.errors.password}>
                            <FormHelperText error sx={{ mx: 0.5, mt: 0.75, fontWeight: 500, height: 20 }}>
                                {formState.errors.password?.message || ' '}
                            </FormHelperText>
                        </Fade>
                    </FormControl>
                </Grid>
            )}

            {/* Forgot password link & Submit button */}
            <Grid item xs={12}>
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        mb: 2.5,
                        mt: 0.5
                    }}
                >
                    <Link
                        href={linkPath}
                        underline="hover"
                        sx={{
                            color: alpha(PRIMARY_COLOR, 0.85),
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            transition: 'all 0.2s',
                            '&:hover': {
                                color: PRIMARY_COLOR,
                                textDecoration: 'underline'
                            }
                        }}
                    >
                        {linkText}
                    </Link>
                </Box>

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loggingIn || hasErrors}
                    sx={{
                        py: 1.5,
                        bgcolor: PRIMARY_COLOR,
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '0.95rem',
                        borderRadius: 2,
                        textTransform: 'none',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 4px 12px rgba(8, 121, 108, 0.25)',
                        transition: 'all 0.3s ease-in-out',
                        height: 54,
                        '&:hover': {
                            bgcolor: alpha(PRIMARY_COLOR, 0.9),
                            boxShadow: '0 6px 16px rgba(8, 121, 108, 0.35)',
                            transform: 'translateY(-1px)'
                        },
                        '&:active': {
                            transform: 'translateY(0)',
                            boxShadow: '0 2px 8px rgba(8, 121, 108, 0.25)',
                        },
                        '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: `linear-gradient(90deg, transparent, ${alpha('#fff', 0.2)}, transparent)`,
                            animation: loggingIn ? 'shine 1.5s infinite' : 'none',
                            '@keyframes shine': {
                                '0%': { left: '-100%' },
                                '100%': { left: '100%' }
                            }
                        },
                        '&:disabled': {
                            bgcolor: alpha(PRIMARY_COLOR, 0.6),
                            color: '#fff',
                            opacity: 0.8
                        }
                    }}
                    endIcon={!loggingIn && <ArrowForwardIcon />}
                >
                    {loggingIn ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CircularProgress size={20} thickness={4} sx={{ color: '#fff', mr: 1 }} />
                            Signing in...
                        </Box>
                    ) : (
                        buttonText
                    )}
                </Button>
            </Grid>
        </Grid>
    );
};

export default AuthenticationForm;