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
    InputAdornment,
    TextField,
    Typography,
    alpha,
    IconButton,
    Button,
    CircularProgress,
} from '@mui/material';
import { Controller } from 'react-hook-form';
import { IAuthenticationForm } from '../interface';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const PRIMARY = '#08796C';
const PRIMARY_DARK = '#065E54';

/* ─── reusable field label ──────────────────────────────────────────── */
const FieldLabel = ({ label, focused }: { label: string; focused: boolean }) => (
    <Typography
        component="label"
        variant="caption"
        sx={{
            display: 'block',
            mb: 0.75,
            fontWeight: 600,
            fontSize: '0.72rem',
            letterSpacing: 0.4,
            textTransform: 'uppercase',
            color: focused ? PRIMARY : '#64748B',
            transition: 'color 0.2s',
        }}
    >
        {label}
    </Typography>
);

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
    const [focused, setFocused] = useState<string | null>(null);

    const fieldSx = (name: string, hasError: boolean) => ({
        '& .MuiOutlinedInput-root': {
            height: 48,
            borderRadius: '10px',
            bgcolor: focused === name ? '#fff' : '#F8FAFC',
            transition: 'background-color 0.2s, box-shadow 0.2s',
            ...(focused === name && {
                boxShadow: `0 0 0 3px ${alpha(PRIMARY, 0.14)}`,
            }),
            '& fieldset': {
                borderColor: hasError
                    ? '#EF4444'
                    : focused === name
                        ? PRIMARY
                        : '#E2E8F0',
                borderWidth: focused === name || hasError ? '1.5px' : '1px',
                transition: 'border-color 0.2s',
            },
            '&:hover fieldset': {
                borderColor: hasError ? '#EF4444' : alpha(PRIMARY, 0.5),
            },
        },
        '& .MuiOutlinedInput-input': {
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#0F172A',
            '&::placeholder': { color: '#94A3B8', opacity: 1 },
        },
    });

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* ── Email ──────────────────────────────────────────────── */}
            <FormControl fullWidth>
                <FieldLabel label="Email Address" focused={focused === 'email'} />
                <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            fullWidth
                            type="email"
                            placeholder="you@pridebank.co.ug"
                            error={!!formState.errors.email}
                            onFocus={() => setFocused('email')}
                            onBlur={() => setFocused(null)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailOutlinedIcon
                                            sx={{ fontSize: 18, color: focused === 'email' ? PRIMARY : '#94A3B8', transition: 'color 0.2s' }}
                                        />
                                    </InputAdornment>
                                ),
                            }}
                            sx={fieldSx('email', !!formState.errors.email)}
                        />
                    )}
                />
                <FormHelperText
                    error
                    sx={{ minHeight: 20, mx: 0, mt: 0.5, mb: 1.5, fontSize: '0.72rem', fontWeight: 500 }}
                >
                    {formState.errors.email?.message ?? ''}
                </FormHelperText>
            </FormControl>

            {/* ── Password ───────────────────────────────────────────── */}
            {password && (
                <FormControl fullWidth>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                        <FieldLabel label="Password" focused={focused === 'password'} />
                        {linkText && (
                            <Typography
                                component={Link}
                                to={linkPath}
                                variant="caption"
                                sx={{
                                    fontWeight: 600,
                                    color: PRIMARY,
                                    textDecoration: 'none',
                                    fontSize: '0.72rem',
                                    '&:hover': { textDecoration: 'underline' },
                                    lineHeight: 1,
                                    mb: 0.75,
                                }}
                            >
                                {linkText}
                            </Typography>
                        )}
                    </Box>
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                fullWidth
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                error={!!formState.errors.password}
                                onFocus={() => setFocused('password')}
                                onBlur={() => setFocused(null)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlinedIcon
                                                sx={{ fontSize: 18, color: focused === 'password' ? PRIMARY : '#94A3B8', transition: 'color 0.2s' }}
                                            />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={handleClickShowPassword}
                                                onMouseDown={handleMouseDownPassword}
                                                edge="end"
                                                size="small"
                                                sx={{
                                                    color: '#94A3B8',
                                                    mr: 0.25,
                                                    '&:hover': { color: PRIMARY, bgcolor: alpha(PRIMARY, 0.06) },
                                                }}
                                            >
                                                {showPassword
                                                    ? <Visibility sx={{ fontSize: 18 }} />
                                                    : <VisibilityOff sx={{ fontSize: 18 }} />
                                                }
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={fieldSx('password', !!formState.errors.password)}
                            />
                        )}
                    />
                    <FormHelperText
                        error
                        sx={{ minHeight: 20, mx: 0, mt: 0.5, mb: 2.5, fontSize: '0.72rem', fontWeight: 500 }}
                    >
                        {formState.errors.password?.message ?? ''}
                    </FormHelperText>
                </FormControl>
            )}

            {/* ── Submit button ──────────────────────────────────────── */}
            <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loggingIn}
                sx={{
                    height: 50,
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    letterSpacing: 0.3,
                    textTransform: 'none',
                    background: loggingIn
                        ? alpha(PRIMARY, 0.7)
                        : `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)`,
                    boxShadow: `0 4px 14px ${alpha(PRIMARY, 0.35)}`,
                    transition: 'all 0.25s ease',
                    '&:hover:not(:disabled)': {
                        background: `linear-gradient(135deg, #099686 0%, ${PRIMARY} 100%)`,
                        boxShadow: `0 6px 20px ${alpha(PRIMARY, 0.45)}`,
                        transform: 'translateY(-1px)',
                    },
                    '&:active:not(:disabled)': {
                        transform: 'translateY(0)',
                        boxShadow: `0 2px 8px ${alpha(PRIMARY, 0.3)}`,
                    },
                    '&.Mui-disabled': {
                        color: '#fff',
                    },
                }}
                endIcon={!loggingIn && <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />}
            >
                {loggingIn ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={17} thickness={4.5} sx={{ color: '#fff' }} />
                        Signing in…
                    </Box>
                ) : buttonText}
            </Button>
        </Box>
    );
};

export default AuthenticationForm;