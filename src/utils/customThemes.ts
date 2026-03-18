/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { alpha, createTheme, responsiveFontSizes } from '@mui/material/styles';

const PRIMARY = '#08796C';
const PRIMARY_DARK = '#065E54';
const PRIMARY_LIGHT = '#0A9B8C';
const SECONDARY = '#BC892C';
const SECONDARY_DARK = '#9B7024';
const BORDER_COLOR = '#E5E9F0';

const customThemes = createTheme({
    palette: {
        primary: {
            main: PRIMARY,
            dark: PRIMARY_DARK,
            light: PRIMARY_LIGHT,
            contrastText: '#ffffff',
        },
        secondary: {
            main: SECONDARY,
            dark: SECONDARY_DARK,
            contrastText: '#ffffff',
        },
        error: {
            main: '#D32F2F',
        },
        warning: {
            main: '#F59E0B',
        },
        info: {
            main: '#3B82F6',
        },
        success: {
            main: '#10B981',
        },
        background: {
            default: '#F1F5FB',
            paper: '#FFFFFF',
        },
        text: {
            primary: '#111827',
            secondary: '#6B7280',
            disabled: '#9CA3AF',
        },
        divider: '#E5E9F0',
        grey: {
            50: '#F9FAFB',
            100: '#F3F4F6',
            200: '#E5E7EB',
            300: '#D1D5DB',
            400: '#9CA3AF',
            500: '#6B7280',
            600: '#4B5563',
            700: '#374151',
            800: '#1F2937',
            900: '#111827',
        },
    },

    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
        /* All font sizes reduced ~15% from the original design values to fit
         * 14" laptop screens (1366×768). The html font-size: 14px base in
         * index.css gives an additional ~12.5% cascade reduction on top. */
        h1: { fontSize: '1.9rem', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em' },
        h2: { fontSize: '1.6rem', fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.01em' },
        h3: { fontSize: '1.3rem', fontWeight: 600, lineHeight: 1.4, letterSpacing: '-0.01em' },
        h4: { fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.4 },
        h5: { fontSize: '0.975rem', fontWeight: 600, lineHeight: 1.5 },
        h6: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.5 },
        subtitle1: { fontSize: '0.825rem', fontWeight: 500, lineHeight: 1.5 },
        subtitle2: { fontSize: '0.8rem', fontWeight: 500, lineHeight: 1.5, color: '#6B7280' },
        body1: { fontSize: '0.825rem', lineHeight: 1.6 },
        body2: { fontSize: '0.8rem', lineHeight: 1.6 },
        caption: { fontSize: '0.7rem', lineHeight: 1.5, color: '#6B7280' },
        overline: { fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' },
        button: { textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.01em' },
    },

    shape: {
        borderRadius: 10,
    },

    shadows: [
        'none',
        '0px 1px 2px rgba(0, 0, 0, 0.06)',
        '0px 1px 3px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.04)',
        '0px 4px 6px -1px rgba(0, 0, 0, 0.07), 0px 2px 4px -1px rgba(0, 0, 0, 0.05)',
        '0px 10px 15px -3px rgba(0, 0, 0, 0.07), 0px 4px 6px -2px rgba(0, 0, 0, 0.04)',
        '0px 20px 25px -5px rgba(0, 0, 0, 0.08), 0px 10px 10px -5px rgba(0, 0, 0, 0.03)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.15)',
        '0px 1px 2px rgba(0, 0, 0, 0.06)',
        '0px 1px 3px rgba(0, 0, 0, 0.08)',
        '0px 4px 6px -1px rgba(0, 0, 0, 0.07)',
        '0px 10px 15px -3px rgba(0, 0, 0, 0.07)',
        '0px 20px 25px -5px rgba(0, 0, 0, 0.08)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.15)',
        '0px 1px 2px rgba(0, 0, 0, 0.06)',
        '0px 1px 3px rgba(0, 0, 0, 0.08)',
        '0px 4px 6px -1px rgba(0, 0, 0, 0.07)',
        '0px 10px 15px -3px rgba(0, 0, 0, 0.07)',
        '0px 20px 25px -5px rgba(0, 0, 0, 0.08)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.15)',
        '0px 1px 2px rgba(0, 0, 0, 0.06)',
        '0px 1px 3px rgba(0, 0, 0, 0.08)',
        '0px 4px 6px -1px rgba(0, 0, 0, 0.07)',
        '0px 10px 15px -3px rgba(0, 0, 0, 0.07)',
        '0px 20px 25px -5px rgba(0, 0, 0, 0.08)',
        '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    ],

    components: {
        MuiCssBaseline: {
            styleOverrides: {
                '*': {
                    boxSizing: 'border-box',
                },
                html: {
                    scrollBehavior: 'smooth',
                },
                body: {
                    fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    backgroundColor: '#F1F5FB',
                },
                '::-webkit-scrollbar': {
                    width: '6px',
                    height: '6px',
                },
                '::-webkit-scrollbar-track': {
                    background: '#F3F4F6',
                },
                '::-webkit-scrollbar-thumb': {
                    background: alpha(PRIMARY, 0.35),
                    borderRadius: '3px',
                    '&:hover': {
                        background: alpha(PRIMARY, 0.55),
                    },
                },
                '::selection': {
                    background: alpha(PRIMARY, 0.2),
                    color: PRIMARY_DARK,
                },
            },
        },

        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    letterSpacing: '0.01em',
                    minHeight: 34,
                    paddingLeft: 16,
                    paddingRight: 16,
                    transition: 'all 0.2s ease',
                    '&:focus-visible': {
                        outline: `2px solid ${alpha(PRIMARY, 0.5)}`,
                        outlineOffset: 2,
                    },
                },
                contained: {
                    boxShadow: `0 1px 3px ${alpha(PRIMARY, 0.3)}, 0 1px 2px ${alpha(PRIMARY, 0.2)}`,
                    '&:hover': {
                        boxShadow: `0 4px 12px ${alpha(PRIMARY, 0.35)}`,
                        transform: 'translateY(-1px)',
                    },
                    '&:active': {
                        transform: 'translateY(0)',
                        boxShadow: `0 1px 3px ${alpha(PRIMARY, 0.3)}`,
                    },
                },
                outlined: {
                    borderWidth: '1.5px',
                    '&:hover': {
                        borderWidth: '1.5px',
                        backgroundColor: alpha(PRIMARY, 0.04),
                    },
                },
                sizeSmall: {
                    minHeight: 28,
                    fontSize: '0.75rem',
                    paddingLeft: 12,
                    paddingRight: 12,
                },
                sizeLarge: {
                    minHeight: 42,
                    fontSize: '0.875rem',
                    paddingLeft: 24,
                    paddingRight: 24,
                },
            },
        },

        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    border: `1px solid ${BORDER_COLOR}`,
                    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.06), 0px 1px 2px rgba(0, 0, 0, 0.04)',
                    transition: 'box-shadow 0.25s ease, transform 0.25s ease',
                },
            },
        },

        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
                elevation1: {
                    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.04)',
                },
                elevation2: {
                    boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.07), 0px 2px 4px -1px rgba(0, 0, 0, 0.04)',
                },
                elevation3: {
                    boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.07), 0px 4px 6px -2px rgba(0, 0, 0, 0.04)',
                },
            },
        },

        MuiTextField: {
            defaultProps: {
                size: 'small',
                variant: 'outlined',
            },
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                        backgroundColor: '#FFFFFF',
                        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                        '& fieldset': {
                            borderColor: BORDER_COLOR,
                            borderWidth: '1.5px',
                            transition: 'border-color 0.2s ease',
                        },
                        '&:hover fieldset': {
                            borderColor: alpha(PRIMARY, 0.4),
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: PRIMARY,
                            borderWidth: '2px',
                        },
                        '&.Mui-focused': {
                            boxShadow: `0 0 0 3px ${alpha(PRIMARY, 0.12)}`,
                        },
                        '&.Mui-error fieldset': {
                            borderColor: '#D32F2F',
                        },
                        '&.Mui-disabled': {
                            backgroundColor: '#F9FAFB',
                        },
                    },
                    '& .MuiInputLabel-root': {
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        '&.Mui-focused': {
                            color: PRIMARY,
                        },
                    },
                    '& .MuiOutlinedInput-input': {
                        fontSize: '0.8rem',
                        fontWeight: 400,
                        padding: '7px 12px',
                    },
                    '& .MuiFormHelperText-root': {
                        marginTop: 4,
                        fontSize: '0.75rem',
                    },
                },
            },
        },

        MuiSelect: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },

        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    fontWeight: 500,
                    fontSize: '0.7rem',
                    height: 22,
                    transition: 'all 0.2s ease',
                },
                sizeSmall: {
                    height: 18,
                    fontSize: '0.65rem',
                },
                sizeMedium: {
                    height: 24,
                },
            },
        },

        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: '#1F2937',
                    color: '#F9FAFB',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    borderRadius: 6,
                    padding: '6px 10px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
                arrow: {
                    color: '#1F2937',
                },
            },
        },

        MuiDivider: {
            styleOverrides: {
                root: {
                    borderColor: '#E5E9F0',
                },
            },
        },

        MuiAvatar: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                },
            },
        },

        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    transition: 'all 0.2s ease',
                    '&.Mui-selected': {
                        fontWeight: 600,
                    },
                },
            },
        },

        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.8rem',
                    minHeight: 38,
                    transition: 'all 0.2s ease',
                    '&.Mui-selected': {
                        fontWeight: 700,
                    },
                },
            },
        },

        MuiTabs: {
            styleOverrides: {
                root: {
                    minHeight: 38,
                },
                indicator: {
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                },
            },
        },

        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 16,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                },
            },
        },

        MuiMenu: {
            styleOverrides: {
                paper: {
                    borderRadius: 10,
                    border: `1px solid ${BORDER_COLOR}`,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                    marginTop: 4,
                },
            },
        },

        MuiMenuItem: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    margin: '2px 6px',
                    fontSize: '0.875rem',
                    transition: 'background-color 0.15s ease',
                    '&:hover': {
                        backgroundColor: alpha(PRIMARY, 0.06),
                    },
                    '&.Mui-selected': {
                        backgroundColor: alpha(PRIMARY, 0.1),
                        fontWeight: 600,
                        '&:hover': {
                            backgroundColor: alpha(PRIMARY, 0.14),
                        },
                    },
                },
            },
        },

        MuiPopover: {
            styleOverrides: {
                paper: {
                    borderRadius: 10,
                    border: `1px solid ${BORDER_COLOR}`,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                },
            },
        },

        MuiBadge: {
            styleOverrides: {
                badge: {
                    fontWeight: 700,
                    fontSize: '0.6875rem',
                },
            },
        },

        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    borderRadius: 4,
                    height: 6,
                    backgroundColor: alpha(PRIMARY, 0.12),
                },
                bar: {
                    borderRadius: 4,
                },
            },
        },

        MuiCircularProgress: {
            styleOverrides: {
                root: {
                    strokeLinecap: 'round',
                },
            },
        },

        MuiDrawer: {
            styleOverrides: {
                paper: {
                    border: 'none',
                },
            },
        },

        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: '0 1px 0 rgba(0,0,0,0.08)',
                },
            },
        },

        MuiIconButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        backgroundColor: alpha(PRIMARY, 0.08),
                    },
                },
            },
        },

        MuiSkeleton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },

        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                },
            },
        },

        MuiSwitch: {
            styleOverrides: {
                root: {
                    padding: 7,
                },
                thumb: {
                    boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                },
                track: {
                    borderRadius: 12,
                    opacity: 1,
                    backgroundColor: '#D1D5DB',
                },
            },
        },

        MuiFormLabel: {
            styleOverrides: {
                root: {
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#374151',
                    '&.Mui-focused': {
                        color: PRIMARY,
                    },
                },
            },
        },
    },
});

export default responsiveFontSizes(customThemes, {
    breakpoints: ['xs', 'sm', 'md'],
    factor: 3,
});
