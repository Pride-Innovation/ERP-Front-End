/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Grid,
    Typography,
    Card,
    CardContent,
    alpha,
    useTheme,
    useMediaQuery,
    TextField,
    InputAdornment,
    IconButton,
    Button,
    FormControl,
    FormHelperText,
    LinearProgress,
    Paper,
    Stack,
    Divider,
    Alert,
    Chip,
    Fade
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import AuthenticationImage from "../../statics/images/logo.png";
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import AuthenticationContainerComponent from '../../components/Container';
import { toast } from 'react-toastify';
import Logo from '../../statics/images/whitelogo.png';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ShieldIcon from '@mui/icons-material/Shield';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LockIcon from '@mui/icons-material/Lock';
import { ROUTES } from '../../core/routes/routes';
import { resetPasswordService } from './service';

// Brand colors
const PRIMARY_COLOR = '#08796C';
const GOLD_COLOR = '#BC892C';

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

const ResetPassword = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { token: pathToken } = useParams<{ token: string }>();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isMedium = useMediaQuery(theme.breakpoints.down('md'));
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
        const urlPath = location.pathname;
        const directToken = "eyJzdWIiOiJzb2RvbmdAcHJpZGViYW5rLmNvLnVnIiwiaWF0IjoxNzU3NDg2MjE1LCJleHAiOjE3NTc0ODk4MTV9.3qRgIoH9TwfZQbpaWRP4u7OphATSsKpv0oULLYESle0";

        // Return the token or null if not found
        return directToken;
    };

    const token = getToken();

    // Initialize form with validation
    const {
        control,
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
            // Simulate API call
            const response = await resetPasswordService(token, data.newPassword);
            console.log(response);

            // In a real app, you'd call your API here
            // const response = await resetPasswordService(token, data.newPassword);
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
    const currentYear = new Date().getFullYear();

    return (
        <AuthenticationContainerComponent>
            <Card
                elevation={0}
                sx={{
                    width: '100%',
                    maxWidth: '950px',
                    // maxHeight: '90vh',
                    borderRadius: { xs: 3, md: 4 },
                    overflow: 'hidden',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.2), 0 5px 15px rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(10px)',
                    background: 'rgba(255,255,255,0.9)',
                    animation: 'fadeIn 0.8s ease-out',
                    '@keyframes fadeIn': {
                        '0%': { opacity: 0, transform: 'translateY(20px)' },
                        '100%': { opacity: 1, transform: 'translateY(0)' }
                    }
                }}
            >
                <Grid container sx={{ height: '100%' }}>
                    {/* Left Panel - Brand Content */}
                    {!isMedium && (
                        <Grid
                            item
                            md={5}
                            lg={4}
                            sx={{
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    background: `linear-gradient(135deg, 
                                                ${alpha(PRIMARY_COLOR, 0.95)} 0%,
                                                ${alpha(PRIMARY_COLOR, 0.85)} 100%)`,
                                    zIndex: 1
                                }
                            }}
                        >
                            {/* Background Image */}
                            <Box
                                sx={{
                                    backgroundImage: `url(${AuthenticationImage})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    height: '100%',
                                    filter: 'grayscale(20%)',
                                }}
                            />

                            {/* Animated circular patterns */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: '15%',
                                    left: '10%',
                                    width: '180px',
                                    height: '180px',
                                    borderRadius: '50%',
                                    border: '1.5px solid rgba(255,255,255,0.1)',
                                    zIndex: 2,
                                    animation: 'float 8s ease-in-out infinite alternate'
                                }}
                            />
                            <Box
                                sx={{
                                    position: 'absolute',
                                    bottom: '10%',
                                    right: '5%',
                                    width: '150px',
                                    height: '150px',
                                    borderRadius: '50%',
                                    border: '1.5px solid rgba(255,255,255,0.08)',
                                    zIndex: 2,
                                    animation: 'float 6s ease-in-out infinite alternate-reverse',
                                    '@keyframes float': {
                                        '0%': { transform: 'translateY(0)' },
                                        '100%': { transform: 'translateY(-15px)' }
                                    }
                                }}
                            />

                            {/* Brand Content Overlay */}
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    zIndex: 2,
                                    p: 3,
                                    color: 'white'
                                }}
                            >
                                {/* Logo */}
                                <Box
                                    component="img"
                                    src={Logo}
                                    alt="Pride Bank Logo"
                                    sx={{
                                        width: 85,
                                        mb: 3,
                                        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))',
                                    }}
                                />

                                {/* Large Lock Icon with glow effect */}
                                <Box
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        bgcolor: 'rgba(255,255,255,0.12)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mb: 2.5,
                                        position: 'relative',
                                        '&::after': {
                                            content: '""',
                                            position: 'absolute',
                                            width: '100%',
                                            height: '100%',
                                            borderRadius: '50%',
                                            background: 'rgba(255,255,255,0.05)',
                                            filter: 'blur(8px)',
                                            animation: 'pulse 3s infinite',
                                        },
                                        '@keyframes pulse': {
                                            '0%': { transform: 'scale(1)', opacity: 0.6 },
                                            '50%': { transform: 'scale(1.2)', opacity: 0.4 },
                                            '100%': { transform: 'scale(1)', opacity: 0.6 },
                                        }
                                    }}
                                >
                                    <LockResetOutlinedIcon sx={{ fontSize: 40, color: '#fff', position: 'relative', zIndex: 1 }} />
                                </Box>

                                {/* Brand Title */}
                                <Typography
                                    variant="h5"
                                    fontWeight={600}
                                    color="#fff"
                                    sx={{
                                        textAlign: 'center',
                                        mb: 1.5,
                                        textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                                    }}
                                >
                                    Reset Your Password
                                </Typography>

                                {/* Brand Subtitle */}
                                <Typography
                                    variant="body1"
                                    fontWeight={300}
                                    color="#fff"
                                    sx={{
                                        textAlign: 'center',
                                        mb: 2,
                                        opacity: 0.95,
                                        textShadow: '0 2px 6px rgba(0,0,0,0.2)',
                                        maxWidth: '80%',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    Create a new secure password for your account
                                </Typography>

                                {/* User Email (if available from token) */}
                                {userEmail && (
                                    <Chip
                                        label={userEmail}
                                        sx={{
                                            color: 'white',
                                            bgcolor: 'rgba(255,255,255,0.15)',
                                            mb: 2.5,
                                            backdropFilter: 'blur(10px)',
                                            '& .MuiChip-label': { px: 1 },
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                )}

                                {/* Decorative Line with animation */}
                                <Box
                                    sx={{
                                        width: '40px',
                                        height: '2.5px',
                                        background: `linear-gradient(to right, ${GOLD_COLOR}, ${alpha(GOLD_COLOR, 0.6)})`,
                                        borderRadius: '2px',
                                        position: 'relative',
                                        '&::after': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            background: `linear-gradient(to right, ${GOLD_COLOR}, ${alpha(GOLD_COLOR, 0.6)})`,
                                            borderRadius: '2px',
                                            filter: 'blur(2px)',
                                            opacity: 0.7,
                                        }
                                    }}
                                />
                            </Box>
                        </Grid>
                    )}

                    {/* Right Panel - Password Reset Form */}
                    <Grid
                        item
                        xs={12}
                        md={7}
                        lg={8}
                        sx={{
                            backgroundColor: '#fff',
                            borderRadius: { xs: 3, md: '0 4px 4px 0' },
                            boxShadow: { xs: '0 10px 40px rgba(0,0,0,0.15)', md: 'none' },
                            position: 'relative',
                            overflow: { xs: 'auto', md: 'hidden' }
                        }}
                    >
                        {/* Decorative Elements */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: -40,
                                right: -40,
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                background: `radial-gradient(circle, ${alpha(PRIMARY_COLOR, 0.08)} 0%, ${alpha(PRIMARY_COLOR, 0)} 70%)`,
                                zIndex: 0
                            }}
                        />
                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: -60,
                                left: -60,
                                width: 120,
                                height: 120,
                                borderRadius: '50%',
                                background: `radial-gradient(circle, ${alpha(GOLD_COLOR, 0.06)} 0%, ${alpha(GOLD_COLOR, 0)} 70%)`,
                                zIndex: 0
                            }}
                        />

                        {/* Form Content */}
                        <CardContent
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                p: { xs: 2, sm: 2.5, md: 3 },
                                height: '100%',
                                position: 'relative',
                                zIndex: 1,
                                overflow: 'auto',
                                '&::-webkit-scrollbar': {
                                    width: '6px'
                                },
                                '&::-webkit-scrollbar-track': {
                                    background: 'transparent'
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    background: alpha('#000', 0.1),
                                    borderRadius: '3px'
                                }
                            }}
                        >
                            {/* Mobile Logo - only shows on medium and smaller screens */}
                            {isMedium && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Box
                                            component="img"
                                            src={Logo}
                                            alt="Pride Bank Logo"
                                            sx={{
                                                width: { xs: 55, sm: 65 },
                                                mb: 1.5,
                                                filter: 'brightness(0.95) contrast(1.05)'
                                            }}
                                        />
                                        <Typography
                                            variant="h6"
                                            fontWeight={700}
                                            color={PRIMARY_COLOR}
                                            sx={{ mb: 0.5, fontSize: '1.15rem' }}
                                        >
                                            Pride Bank
                                        </Typography>
                                        <Typography
                                            variant="subtitle2"
                                            color="text.secondary"
                                            sx={{ fontSize: '0.75rem' }}
                                        >
                                            Reset Your Password
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            {/* Top Navigation Row */}
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 2
                            }}>
                                {/* Back to Login Link */}
                                <Button
                                    component={Link}
                                    to={ROUTES.LOGIN}
                                    startIcon={<KeyboardBackspaceIcon sx={{ fontSize: '0.9rem' }} />}
                                    variant="text"
                                    size="small"
                                    sx={{
                                        color: 'text.secondary',
                                        textTransform: 'none',
                                        fontSize: '0.75rem',
                                        py: 0.5,
                                        '&:hover': {
                                            bgcolor: alpha('#000', 0.03),
                                            color: 'text.primary'
                                        }
                                    }}
                                >
                                    Back to Login
                                </Button>

                                {/* Token Status Indicator */}
                                {token && (
                                    <Chip
                                        icon={<VpnKeyIcon sx={{ fontSize: '0.9rem !important', ml: 0.5 }} />}
                                        label="Reset token detected"
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            bgcolor: alpha(PRIMARY_COLOR, 0.04),
                                            color: alpha(PRIMARY_COLOR, 0.9),
                                            fontSize: '0.65rem',
                                            borderColor: alpha(PRIMARY_COLOR, 0.15),
                                            fontWeight: 500,
                                            py: 0.5,
                                            height: 24,
                                            '& .MuiChip-label': { px: 1 }
                                        }}
                                    />
                                )}
                            </Box>

                            {resetSuccess ? (
                                /* Success message */
                                <Fade in={resetSuccess}>
                                    <Box
                                        sx={{
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            py: 1,
                                            animation: 'fadeIn 0.5s ease-out',
                                        }}
                                    >
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                maxWidth: '90%',
                                                width: 350,
                                                p: 2.5,
                                                textAlign: 'center',
                                                borderRadius: 2,
                                                bgcolor: alpha('#f9f9f9', 0.6),
                                                border: `1px solid ${alpha('#000', 0.04)}`,
                                                boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 60,
                                                    height: 60,
                                                    borderRadius: '50%',
                                                    bgcolor: alpha('#4caf50', 0.1),
                                                    color: '#4caf50',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mx: 'auto',
                                                    mb: 2,
                                                    position: 'relative',
                                                    '&::after': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        width: '100%',
                                                        height: '100%',
                                                        borderRadius: '50%',
                                                        background: 'rgba(76,175,80,0.05)',
                                                        filter: 'blur(8px)',
                                                    }
                                                }}
                                            >
                                                <CheckCircleIcon sx={{ fontSize: 30, position: 'relative', zIndex: 1 }} />
                                            </Box>

                                            <Typography variant="h5" fontWeight={600} sx={{ mb: 1, fontSize: '1.3rem' }}>
                                                Password Reset Successful
                                            </Typography>

                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontSize: '0.85rem' }}>
                                                Your password has been reset successfully. You can now log in with your new password.
                                            </Typography>

                                            <Button
                                                variant="contained"
                                                component={Link}
                                                to={ROUTES.LOGIN}
                                                sx={{
                                                    bgcolor: PRIMARY_COLOR,
                                                    textTransform: 'none',
                                                    borderRadius: 1.5,
                                                    px: 3,
                                                    py: 0.75,
                                                    boxShadow: `0 4px 12px ${alpha(PRIMARY_COLOR, 0.25)}`,
                                                    '&:hover': {
                                                        bgcolor: alpha(PRIMARY_COLOR, 0.9),
                                                        boxShadow: `0 6px 16px ${alpha(PRIMARY_COLOR, 0.35)}`,
                                                    }
                                                }}
                                            >
                                                Return to Login
                                            </Button>
                                        </Paper>
                                    </Box>
                                </Fade>
                            ) : (
                                /* Reset Password Form */
                                <>
                                    {/* Form Header */}
                                    <Box
                                        sx={{
                                            mb: 2.5,
                                            position: 'relative',
                                            pb: 0.5
                                        }}
                                    >
                                        {/* Decorative element */}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                left: -12,
                                                top: 8,
                                                width: 3,
                                                height: 14,
                                                backgroundColor: PRIMARY_COLOR,
                                                borderRadius: 1
                                            }}
                                        />

                                        <Typography
                                            variant="h4"
                                            fontWeight={700}
                                            color="text.primary"
                                            sx={{
                                                mb: 0.75,
                                                fontSize: { xs: '1.6rem', sm: '1.8rem' },
                                                background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${alpha(PRIMARY_COLOR, 0.7)} 100%)`,
                                                backgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                WebkitBackgroundClip: 'text'
                                            }}
                                        >
                                            Create a New Password
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            color="text.secondary"
                                            sx={{
                                                lineHeight: 1.4,
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            Please create a strong password that you don't use elsewhere
                                        </Typography>
                                    </Box>

                                    <Box
                                        component="form"
                                        onSubmit={handleSubmit(onSubmit)}
                                        sx={{ mt: 0.5 }}
                                        noValidate
                                    >
                                        <Grid container spacing={2}>
                                            {/* Left column with input fields */}
                                            <Grid item xs={12} md={7}>
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: { xs: 2, sm: 2 },
                                                        borderRadius: 2,
                                                        bgcolor: alpha('#f9f9f9', 0.5),
                                                        border: `1px solid ${alpha('#000', 0.04)}`,
                                                        mb: { xs: 2, md: 0 },
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            boxShadow: `0 4px 20px ${alpha('#000', 0.05)}`,
                                                            bgcolor: '#fff'
                                                        }
                                                    }}
                                                >
                                                    {/* New Password */}
                                                    <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                mb: 0.5,
                                                                ml: 0.5,
                                                                fontWeight: 500,
                                                                fontSize: '0.8rem',
                                                                color: isPasswordFieldActive ? PRIMARY_COLOR : 'text.secondary',
                                                                transition: 'color 0.2s ease-in-out',
                                                                display: 'flex',
                                                                alignItems: 'center'
                                                            }}
                                                        >
                                                            <LockIcon sx={{ mr: 0.5, fontSize: '0.85rem' }} />
                                                            New Password
                                                        </Typography>
                                                        <TextField
                                                            {...register('newPassword')}
                                                            id="newPassword"
                                                            type={showNewPassword ? 'text' : 'password'}
                                                            variant="outlined"
                                                            fullWidth
                                                            error={!!formState.errors.newPassword}
                                                            placeholder="Enter your new password"
                                                            size="small"
                                                            InputProps={{
                                                                endAdornment: (
                                                                    <InputAdornment position="end">
                                                                        <IconButton
                                                                            aria-label="toggle password visibility"
                                                                            onClick={handleToggleNewPassword}
                                                                            onMouseDown={handleMouseDownPassword}
                                                                            edge="end"
                                                                            size="small"
                                                                        >
                                                                            {showNewPassword ? (
                                                                                <VisibilityOffOutlined fontSize="small" />
                                                                            ) : (
                                                                                <VisibilityOutlined fontSize="small" />
                                                                            )}
                                                                        </IconButton>
                                                                    </InputAdornment>
                                                                ),
                                                                sx: {
                                                                    borderRadius: 1.5,
                                                                    bgcolor: '#fff',
                                                                    height: 40
                                                                }
                                                            }}
                                                            sx={{
                                                                '& .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: formState.errors.newPassword
                                                                        ? theme.palette.error.main
                                                                        : isPasswordFieldActive
                                                                            ? PRIMARY_COLOR
                                                                            : alpha('#000', 0.15),
                                                                    borderWidth: formState.errors.newPassword || isPasswordFieldActive ? 1.5 : 1,
                                                                    transition: 'border-color 0.2s ease-in-out'
                                                                }
                                                            }}
                                                        />

                                                        {formState.errors.newPassword ? (
                                                            <FormHelperText error sx={{ mx: 0.5, fontSize: '0.7rem' }}>
                                                                {formState.errors.newPassword.message}
                                                            </FormHelperText>
                                                        ) : null}

                                                        {/* Password Strength Meter */}
                                                        {newPassword.length > 0 && (
                                                            <Box sx={{ mt: 1, mb: 0.5 }}>
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                                    <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.7rem' }}>
                                                                        Password strength:
                                                                    </Typography>
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{
                                                                            fontWeight: 600,
                                                                            color: strengthInfo.color,
                                                                            fontSize: '0.7rem'
                                                                        }}
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
                                                    <FormControl fullWidth variant="outlined">
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                mb: 0.5,
                                                                ml: 0.5,
                                                                fontWeight: 500,
                                                                fontSize: '0.8rem',
                                                                color: formState.touchedFields.confirmPassword ? PRIMARY_COLOR : 'text.secondary',
                                                                transition: 'color 0.2s ease-in-out',
                                                                display: 'flex',
                                                                alignItems: 'center'
                                                            }}
                                                        >
                                                            <LockIcon sx={{ mr: 0.5, fontSize: '0.85rem' }} />
                                                            Confirm Password
                                                        </Typography>
                                                        <TextField
                                                            {...register('confirmPassword')}
                                                            id="confirmPassword"
                                                            type={showConfirmPassword ? 'text' : 'password'}
                                                            variant="outlined"
                                                            fullWidth
                                                            error={!!formState.errors.confirmPassword}
                                                            placeholder="Confirm your new password"
                                                            size="small"
                                                            InputProps={{
                                                                endAdornment: (
                                                                    <InputAdornment position="end">
                                                                        <IconButton
                                                                            aria-label="toggle password visibility"
                                                                            onClick={handleToggleConfirmPassword}
                                                                            onMouseDown={handleMouseDownPassword}
                                                                            edge="end"
                                                                            size="small"
                                                                        >
                                                                            {showConfirmPassword ? (
                                                                                <VisibilityOffOutlined fontSize="small" />
                                                                            ) : (
                                                                                <VisibilityOutlined fontSize="small" />
                                                                            )}
                                                                        </IconButton>
                                                                    </InputAdornment>
                                                                ),
                                                                sx: {
                                                                    borderRadius: 1.5,
                                                                    bgcolor: '#fff',
                                                                    height: 40
                                                                }
                                                            }}
                                                            sx={{
                                                                '& .MuiOutlinedInput-notchedOutline': {
                                                                    borderColor: formState.errors.confirmPassword
                                                                        ? theme.palette.error.main
                                                                        : formState.touchedFields.confirmPassword
                                                                            ? PRIMARY_COLOR
                                                                            : alpha('#000', 0.15),
                                                                    borderWidth: formState.errors.confirmPassword || formState.touchedFields.confirmPassword ? 1.5 : 1,
                                                                    transition: 'border-color 0.2s ease-in-out'
                                                                }
                                                            }}
                                                        />
                                                        {formState.errors.confirmPassword && (
                                                            <FormHelperText error sx={{ mx: 0.5, fontSize: '0.7rem' }}>
                                                                {formState.errors.confirmPassword.message}
                                                            </FormHelperText>
                                                        )}
                                                    </FormControl>

                                                    {/* Security Tips */}
                                                    <Box
                                                        sx={{
                                                            mt: 2,
                                                            pt: 1.5,
                                                            borderTop: `1px dashed ${alpha('#000', 0.1)}`,
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                display: 'block',
                                                                color: alpha(PRIMARY_COLOR, 0.8),
                                                                fontWeight: 500,
                                                                fontSize: '0.7rem',
                                                                mb: 0.5
                                                            }}
                                                        >
                                                            <ShieldIcon sx={{ fontSize: '0.8rem', mr: 0.5, verticalAlign: 'text-bottom' }} />
                                                            Security Tip
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                                            Create a unique password that you don't use for other websites or applications.
                                                        </Typography>
                                                    </Box>
                                                </Paper>

                                                {/* Token Status */}
                                                {!token ? (
                                                    <Alert
                                                        severity="warning"
                                                        variant="outlined"
                                                        sx={{
                                                            mt: 1.5,
                                                            fontSize: '0.75rem',
                                                            py: 0.75,
                                                            '& .MuiAlert-icon': { fontSize: '1rem' }
                                                        }}
                                                    >
                                                        Reset token is missing. Please use a valid reset link.
                                                    </Alert>
                                                ) : (
                                                    userEmail && (
                                                        <Alert
                                                            severity="info"
                                                            icon={<VpnKeyIcon fontSize="small" />}
                                                            variant="outlined"
                                                            sx={{
                                                                mt: 1.5,
                                                                fontSize: '0.75rem',
                                                                py: 0.75,
                                                                '& .MuiAlert-icon': { fontSize: '1rem' }
                                                            }}
                                                        >
                                                            Resetting password for: <strong>{userEmail}</strong>
                                                        </Alert>
                                                    )
                                                )}
                                            </Grid>

                                            {/* Right column with requirements */}
                                            <Grid item xs={12} md={5}>
                                                <Box
                                                    sx={{
                                                        p: 2,
                                                        bgcolor: alpha(PRIMARY_COLOR, 0.04),
                                                        borderRadius: 1.5,
                                                        border: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`,
                                                        height: '100%',
                                                        display: 'flex',
                                                        flexDirection: 'column'
                                                    }}
                                                >
                                                    {/* Header */}
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                                        <ShieldIcon sx={{ color: PRIMARY_COLOR, mr: 1, fontSize: '1rem' }} />
                                                        <Typography variant="subtitle2" sx={{ color: PRIMARY_COLOR, fontWeight: 600, fontSize: '0.85rem' }}>
                                                            Password Requirements
                                                        </Typography>
                                                    </Box>

                                                    <Divider sx={{ my: 1, opacity: 0.5 }} />

                                                    {/* Individual requirements */}
                                                    <Stack spacing={1} sx={{ mt: 1 }}>
                                                        <RequirementItem
                                                            text="At least 8 characters long"
                                                            fulfilled={hasMinLength}
                                                            active={isPasswordFieldActive}
                                                        />
                                                        <RequirementItem
                                                            text="Include at least one uppercase letter (A-Z)"
                                                            fulfilled={hasUppercase}
                                                            active={isPasswordFieldActive}
                                                        />
                                                        <RequirementItem
                                                            text="Include at least one lowercase letter (a-z)"
                                                            fulfilled={hasLowercase}
                                                            active={isPasswordFieldActive}
                                                        />
                                                        <RequirementItem
                                                            text="Include at least one number (0-9)"
                                                            fulfilled={hasNumber}
                                                            active={isPasswordFieldActive}
                                                        />
                                                        <RequirementItem
                                                            text="Include at least one special character (!@#$%^&*)"
                                                            fulfilled={hasSpecialChar}
                                                            active={isPasswordFieldActive}
                                                        />
                                                    </Stack>

                                                    {/* Examples */}
                                                    <Box sx={{ mt: 'auto', pt: 1.5 }}>
                                                        <Typography variant="caption" color={alpha('#000', 0.6)} sx={{ fontWeight: 500, fontSize: '0.7rem', display: 'block', mb: 0.5 }}>
                                                            Good password examples:
                                                        </Typography>
                                                        <Box
                                                            component="ul"
                                                            sx={{
                                                                m: 0,
                                                                pl: 2,
                                                                '& li': {
                                                                    fontSize: '0.7rem',
                                                                    color: alpha('#000', 0.5),
                                                                    mb: 0.25
                                                                }
                                                            }}
                                                        >
                                                            <li>Tr@vel2Africa!</li>
                                                            <li>Bank$ecure2023</li>
                                                            <li>Pride#C0nnect</li>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        </Grid>

                                        {/* Submit Button */}
                                        <Box sx={{ mt: 2 }}>
                                            <Button
                                                type="submit"
                                                fullWidth
                                                variant="contained"
                                                disabled={isSubmitting || !formState.isValid || !token}
                                                sx={{
                                                    py: 1,
                                                    bgcolor: PRIMARY_COLOR,
                                                    color: '#fff',
                                                    fontWeight: 600,
                                                    fontSize: '0.9rem',
                                                    borderRadius: 1.5,
                                                    textTransform: 'none',
                                                    position: 'relative',
                                                    boxShadow: '0 4px 12px rgba(8, 121, 108, 0.25)',
                                                    transition: 'all 0.3s ease-in-out',
                                                    height: 42,
                                                    overflow: 'hidden',
                                                    '&:hover': {
                                                        bgcolor: alpha(PRIMARY_COLOR, 0.9),
                                                        boxShadow: '0 6px 16px rgba(8, 121, 108, 0.35)',
                                                        transform: 'translateY(-1px)'
                                                    },
                                                    '&:active': {
                                                        transform: 'translateY(0)',
                                                    },
                                                    '&::after': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: '-100%',
                                                        width: '100%',
                                                        height: '100%',
                                                        background: `linear-gradient(90deg, transparent, ${alpha('#fff', 0.2)}, transparent)`,
                                                        animation: isSubmitting ? 'shine 1.5s infinite' : 'none',
                                                        '@keyframes shine': {
                                                            '0%': { left: '-100%' },
                                                            '100%': { left: '100%' }
                                                        }
                                                    },
                                                    '&:disabled': {
                                                        bgcolor: alpha(PRIMARY_COLOR, 0.6),
                                                        color: '#fff',
                                                    }
                                                }}
                                            >
                                                {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
                                            </Button>
                                        </Box>
                                    </Box>
                                </>
                            )}

                            <Box sx={{ mt: 'auto', pt: 2 }}>
                                <Divider sx={{ mb: 1.5, opacity: 0.6 }} />
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: alpha('#000', 0.6),
                                            display: 'block',
                                            fontSize: '0.65rem'
                                        }}
                                    >
                                        &copy; {currentYear} Pride Bank Limited.
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: alpha('#000', 0.5),
                                            fontSize: '0.65rem'
                                        }}
                                    >
                                        All Rights Reserved.
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Grid>
                </Grid>
            </Card>
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