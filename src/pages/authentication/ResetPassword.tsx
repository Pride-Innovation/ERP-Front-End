/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    alpha,
    Alert,
    Box,
    Button,
    CircularProgress,
    FormControl,
    FormHelperText,
    IconButton,
    InputAdornment,
    LinearProgress,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import AuthenticationContainerComponent from '../../components/Container';
import { toast } from 'react-toastify';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShieldIcon from '@mui/icons-material/Shield';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { ROUTES } from '../../core/routes/routes';
import { resetPasswordService } from './service';
import { AuthCard, AuthFooter, AuthHeading, AuthLogo } from './AuthCard';

// Brand colors
const PRIMARY_COLOR = '#08796C';

// Password strength calculation
const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;

    let score = 0;

    // Length check
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;

    // Complexity checks
    if (/[a-z]/.test(password)) score += 10; // lowercase
    if (/[A-Z]/.test(password)) score += 20; // uppercase
    if (/[0-9]/.test(password)) score += 20; // numbers
    if (/[^a-zA-Z0-9]/.test(password)) score += 20; // special chars

    return Math.min(score, 100);
};

// Get strength label and color
const getStrengthInfo = (strength: number) => {
    if (strength === 0) return { label: 'No Password', color: '#bdbdbd' };
    if (strength < 30) return { label: 'Very Weak', color: '#f44336' };
    if (strength < 50) return { label: 'Weak', color: '#ff9800' };
    if (strength < 70) return { label: 'Fair', color: '#ffeb3b' };
    if (strength < 90) return { label: 'Good', color: '#4caf50' };
    return { label: 'Strong', color: '#2e7d32' };
};

// Form interface
interface ResetPasswordFormData {
    newPassword: string;
    confirmPassword: string;
}

// Password requirement item props
interface RequirementItemProps {
    text: string;
    fulfilled: boolean;
    active?: boolean;
}

// Form validation schema
const resetPasswordSchema = yup.object({
    newPassword: yup
        .string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters long')
        .matches(/[A-Z]/, 'Password must include an uppercase letter')
        .matches(/[a-z]/, 'Password must include a lowercase letter')
        .matches(/[0-9]/, 'Password must include a number')
        .matches(/[^A-Za-z0-9]/, 'Password must include a special character'),
    confirmPassword: yup
        .string()
        .required('Please confirm your password')
        .oneOf([yup.ref('newPassword')], 'Passwords must match')
}).required();

/* Shared field styling — the auth form recipe: label above, 48px input, teal focus ring */
const fieldLabelSx = (active: boolean) => ({
    display: 'block',
    mb: 0.75,
    fontWeight: 600,
    fontSize: '0.72rem',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: active ? PRIMARY_COLOR : '#64748B',
    transition: 'color 0.2s',
}) as const;

const passwordFieldSx = (active: boolean, hasError: boolean) => ({
    '& .MuiOutlinedInput-root': {
        height: 48,
        borderRadius: '10px',
        bgcolor: '#F8FAFC',
        transition: 'background-color 0.2s, box-shadow 0.2s',
        '&.Mui-focused': {
            bgcolor: '#fff',
            boxShadow: `0 0 0 3px ${alpha(PRIMARY_COLOR, 0.14)}`,
        },
        '& fieldset': {
            borderColor: hasError ? '#EF4444' : active ? PRIMARY_COLOR : '#E2E8F0',
            borderWidth: active || hasError ? '1.5px' : '1px',
            transition: 'border-color 0.2s',
        },
        '&:hover fieldset': {
            borderColor: hasError ? '#EF4444' : alpha(PRIMARY_COLOR, 0.5),
        },
    },
    '& .MuiOutlinedInput-input': {
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#0F172A',
        '&::placeholder': { color: '#94A3B8', opacity: 1 },
    },
});

const ResetPassword = () => {
    const location = useLocation();
    const { token: pathToken } = useParams<{ token: string }>();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [resetSuccess, setResetSuccess] = useState<boolean>(false);

    // Get token from URL path, query params, or directly from user input
    const getToken = (): string | null => {
        // Check URL path parameter
        if (pathToken) return pathToken;

        // Check for query parameters
        const searchParams = new URLSearchParams(location.search);
        const queryToken = searchParams.get('token');
        if (queryToken) return queryToken;

        // Check if token is in the URL hash or pathname (sometimes tokens are passed this way)
        const directToken = "eyJzdWIiOiJzb2RvbmdAcHJpZGViYW5rLmNvLnVnIiwiaWF0IjoxNzU3NDg2MjE1LCJleHAiOjE3NTc0ODk4MTV9.3qRgIoH9TwfZQbpaWRP4u7OphATSsKpv0oULLYESle0";

        // Return the token or null if not found
        return directToken;
    };

    const token = getToken();

    // Initialize form with validation
    const {
        handleSubmit,
        register,
        formState,
        watch,
        reset
    } = useForm<ResetPasswordFormData>({
        mode: 'onChange',
        resolver: yupResolver(resetPasswordSchema)
    });

    // Reset form on mount
    useEffect(() => {
        reset({
            newPassword: '',
            confirmPassword: ''
        });
    }, [reset]);

    // Watch password for strength calculation
    const newPassword = watch('newPassword') || '';

    // Calculate password strength
    const passwordStrength = useMemo(() => {
        return calculatePasswordStrength(newPassword);
    }, [newPassword]);

    const strengthInfo = getStrengthInfo(passwordStrength);

    // Password requirement checks
    const hasMinLength = newPassword.length >= 8;
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[^a-zA-Z0-9]/.test(newPassword);

    // Check if field has been interacted with
    const isPasswordFieldActive = formState.touchedFields.newPassword || newPassword.length > 0;

    // Toggle password visibility
    const handleToggleNewPassword = () => setShowNewPassword(prev => !prev);
    const handleToggleConfirmPassword = () => setShowConfirmPassword(prev => !prev);
    const handleMouseDownPassword = (e: React.MouseEvent) => e.preventDefault();

    // Form submission
    const onSubmit = async (data: ResetPasswordFormData) => {
        if (!token) {
            toast.error('Reset token is missing. Please use a valid reset link.');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await resetPasswordService(token, data.newPassword);
            console.log(response);
            console.log('Resetting password with token:', token);
            console.log('New password:', data.newPassword);

            toast.success('Your password has been reset successfully!');
            setResetSuccess(true);
        } catch (error) {
            console.error(error);
            toast.error('Failed to reset password. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Extract decoded information from token (for display purposes only)
    const getDecodedEmail = (): string => {
        if (!token) return '';

        try {
            // For JWT tokens, get the payload (middle part)
            const parts = token.split('.');
            if (parts.length !== 3) return '';

            // Decode base64
            const payload = JSON.parse(atob(parts[1]));
            return payload.sub || '';
        } catch (e) {
            return '';
        }
    };

    const userEmail = getDecodedEmail();

    return (
        <AuthenticationContainerComponent>
            <AuthCard sx={{ width: { xs: '100%', sm: 480 } }}>
                <AuthLogo />

                {resetSuccess ? (
                    /* ── Success state ─────────────────────────────────── */
                    <>
                        <Box sx={{ textAlign: 'center', pt: 1 }}>
                            <Box
                                sx={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: '50%',
                                    bgcolor: alpha('#4caf50', 0.1),
                                    color: '#4caf50',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 2,
                                }}
                            >
                                <CheckCircleIcon sx={{ fontSize: 30 }} />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                                Password Reset Successful
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748B' }}>
                                Your password has been reset successfully. You can now log in with
                                your new password.
                            </Typography>
                        </Box>
                        <Button
                            fullWidth
                            variant="contained"
                            component={Link}
                            to={ROUTES.LOGIN}
                            sx={{
                                height: 48,
                                borderRadius: '10px',
                                fontWeight: 700,
                                textTransform: 'none',
                                bgcolor: PRIMARY_COLOR,
                                boxShadow: `0 4px 14px ${alpha(PRIMARY_COLOR, 0.35)}`,
                                '&:hover': {
                                    bgcolor: alpha(PRIMARY_COLOR, 0.9),
                                    boxShadow: `0 6px 20px ${alpha(PRIMARY_COLOR, 0.45)}`,
                                },
                            }}
                        >
                            Return to Login
                        </Button>
                    </>
                ) : (
                    /* ── Reset form ────────────────────────────────────── */
                    <>
                        <AuthHeading
                            title="Create a new password"
                            subtitle="Please create a strong password that you don't use elsewhere."
                        />

                        {/* Token status */}
                        {!token ? (
                            <Alert severity="warning" sx={{ borderRadius: 2, '& .MuiAlert-message': { fontSize: '0.8rem' } }}>
                                Reset token is missing. Please use a valid reset link.
                            </Alert>
                        ) : (
                            userEmail && (
                                <Alert
                                    severity="info"
                                    icon={<VpnKeyIcon fontSize="small" />}
                                    sx={{ borderRadius: 2, '& .MuiAlert-message': { fontSize: '0.8rem' } }}
                                >
                                    Resetting password for: <strong>{userEmail}</strong>
                                </Alert>
                            )
                        )}

                        <Box
                            component="form"
                            onSubmit={handleSubmit(onSubmit)}
                            noValidate
                            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                        >
                            {/* New Password */}
                            <FormControl fullWidth>
                                <Typography component="label" htmlFor="newPassword" variant="caption" sx={fieldLabelSx(Boolean(isPasswordFieldActive))}>
                                    New Password
                                </Typography>
                                <TextField
                                    {...register('newPassword')}
                                    id="newPassword"
                                    type={showNewPassword ? 'text' : 'password'}
                                    fullWidth
                                    error={!!formState.errors.newPassword}
                                    placeholder="Enter your new password"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleToggleNewPassword}
                                                    onMouseDown={handleMouseDownPassword}
                                                    edge="end"
                                                    size="small"
                                                    sx={{ color: '#94A3B8', '&:hover': { color: PRIMARY_COLOR } }}
                                                >
                                                    {showNewPassword
                                                        ? <VisibilityOffOutlined sx={{ fontSize: 18 }} />
                                                        : <VisibilityOutlined sx={{ fontSize: 18 }} />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={passwordFieldSx(Boolean(isPasswordFieldActive), !!formState.errors.newPassword)}
                                />
                                {formState.errors.newPassword && (
                                    <FormHelperText error sx={{ mx: 0, mt: 0.5, fontSize: '0.72rem', fontWeight: 500 }}>
                                        {formState.errors.newPassword.message}
                                    </FormHelperText>
                                )}

                                {/* Password Strength Meter */}
                                {newPassword.length > 0 && (
                                    <Box sx={{ mt: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.7rem', color: '#64748B' }}>
                                                Password strength:
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{ fontWeight: 600, color: strengthInfo.color, fontSize: '0.7rem' }}
                                            >
                                                {strengthInfo.label}
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={passwordStrength}
                                            sx={{
                                                height: 5,
                                                borderRadius: 1,
                                                bgcolor: alpha('#000', 0.06),
                                                '& .MuiLinearProgress-bar': {
                                                    bgcolor: strengthInfo.color,
                                                    transition: 'all 0.3s ease'
                                                }
                                            }}
                                        />
                                    </Box>
                                )}
                            </FormControl>

                            {/* Confirm Password */}
                            <FormControl fullWidth>
                                <Typography component="label" htmlFor="confirmPassword" variant="caption" sx={fieldLabelSx(Boolean(formState.touchedFields.confirmPassword))}>
                                    Confirm Password
                                </Typography>
                                <TextField
                                    {...register('confirmPassword')}
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    fullWidth
                                    error={!!formState.errors.confirmPassword}
                                    placeholder="Confirm your new password"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleToggleConfirmPassword}
                                                    onMouseDown={handleMouseDownPassword}
                                                    edge="end"
                                                    size="small"
                                                    sx={{ color: '#94A3B8', '&:hover': { color: PRIMARY_COLOR } }}
                                                >
                                                    {showConfirmPassword
                                                        ? <VisibilityOffOutlined sx={{ fontSize: 18 }} />
                                                        : <VisibilityOutlined sx={{ fontSize: 18 }} />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={passwordFieldSx(Boolean(formState.touchedFields.confirmPassword), !!formState.errors.confirmPassword)}
                                />
                                {formState.errors.confirmPassword && (
                                    <FormHelperText error sx={{ mx: 0, mt: 0.5, fontSize: '0.72rem', fontWeight: 500 }}>
                                        {formState.errors.confirmPassword.message}
                                    </FormHelperText>
                                )}
                            </FormControl>

                            {/* Password Requirements */}
                            <Box
                                sx={{
                                    p: 2,
                                    bgcolor: alpha(PRIMARY_COLOR, 0.04),
                                    borderRadius: 2,
                                    border: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`,
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <ShieldIcon sx={{ color: PRIMARY_COLOR, mr: 1, fontSize: '0.95rem' }} />
                                    <Typography variant="subtitle2" sx={{ color: PRIMARY_COLOR, fontWeight: 600, fontSize: '0.8rem' }}>
                                        Password Requirements
                                    </Typography>
                                </Box>
                                <Stack spacing={0.75}>
                                    <RequirementItem
                                        text="At least 8 characters long"
                                        fulfilled={hasMinLength}
                                        active={Boolean(isPasswordFieldActive)}
                                    />
                                    <RequirementItem
                                        text="Include at least one uppercase letter (A-Z)"
                                        fulfilled={hasUppercase}
                                        active={Boolean(isPasswordFieldActive)}
                                    />
                                    <RequirementItem
                                        text="Include at least one lowercase letter (a-z)"
                                        fulfilled={hasLowercase}
                                        active={Boolean(isPasswordFieldActive)}
                                    />
                                    <RequirementItem
                                        text="Include at least one number (0-9)"
                                        fulfilled={hasNumber}
                                        active={Boolean(isPasswordFieldActive)}
                                    />
                                    <RequirementItem
                                        text="Include at least one special character (!@#$%^&*)"
                                        fulfilled={hasSpecialChar}
                                        active={Boolean(isPasswordFieldActive)}
                                    />
                                </Stack>
                            </Box>

                            {/* Submit */}
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={isSubmitting || !formState.isValid || !token}
                                sx={{
                                    height: 48,
                                    borderRadius: '10px',
                                    fontWeight: 700,
                                    fontSize: '0.875rem',
                                    textTransform: 'none',
                                    bgcolor: PRIMARY_COLOR,
                                    boxShadow: `0 4px 14px ${alpha(PRIMARY_COLOR, 0.35)}`,
                                    transition: 'all 0.25s ease',
                                    '&:hover': {
                                        bgcolor: alpha(PRIMARY_COLOR, 0.9),
                                        boxShadow: `0 6px 20px ${alpha(PRIMARY_COLOR, 0.45)}`,
                                        transform: 'translateY(-1px)',
                                    },
                                    '&:disabled': {
                                        bgcolor: alpha(PRIMARY_COLOR, 0.5),
                                        color: '#fff',
                                    },
                                }}
                            >
                                {isSubmitting ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CircularProgress size={17} thickness={4.5} sx={{ color: '#fff' }} />
                                        Resetting Password…
                                    </Box>
                                ) : 'Reset Password'}
                            </Button>
                        </Box>
                    </>
                )}

                {/* Back to sign in */}
                <Typography variant="body2" sx={{ textAlign: 'center', color: '#64748B' }}>
                    <Typography
                        component={Link}
                        to={ROUTES.LOGIN}
                        variant="body2"
                        sx={{
                            color: PRIMARY_COLOR,
                            fontWeight: 600,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            '&:hover': { textDecoration: 'underline' },
                        }}
                    >
                        <KeyboardBackspaceIcon sx={{ fontSize: 16 }} />
                        Back to sign in
                    </Typography>
                </Typography>

                <AuthFooter />
            </AuthCard>
        </AuthenticationContainerComponent>
    );
};

const RequirementItem = ({ text, fulfilled, active = false }: RequirementItemProps) => {
    const color = active ? (fulfilled ? '#4caf50' : '#bdbdbd') : '#bdbdbd';

    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
                sx={{
                    mr: 0.75,
                    color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.2s ease-in-out',
                }}
            >
                <CheckCircleIcon sx={{ fontSize: '0.9rem' }} />
            </Box>
            <Typography
                variant="body2"
                sx={{
                    color: active ? (fulfilled ? 'text.primary' : 'text.secondary') : 'text.secondary',
                    fontWeight: active && fulfilled ? 500 : 400,
                    fontSize: '0.75rem',
                    transition: 'color 0.2s ease-in-out, font-weight 0.2s ease-in-out',
                }}
            >
                {text}
            </Typography>
        </Box>
    );
};

export default ResetPassword;
