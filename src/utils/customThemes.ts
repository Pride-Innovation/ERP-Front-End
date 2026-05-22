/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { alpha, createTheme, responsiveFontSizes } from '@mui/material/styles';
import {
    border,
    brand,
    elevation,
    gold,
    neutral,
    radii,
    status,
    surface,
    text,
} from './tokens';
import './theme.d';

// Saturated brand accent — not part of the 50-900 scale because it's only
// used for the `palette.primary.light` slot, which MUI consumes for ripples
// and subtle highlights.
const PRIMARY_LIGHT_ACCENT = '#0A9B8C';

const customThemes = createTheme({
    palette: {
        primary: {
            main: brand[500],
            dark: brand[700],
            light: PRIMARY_LIGHT_ACCENT,
            contrastText: neutral[0],
        },
        secondary: {
            main: gold[500],
            dark: gold[700],
            contrastText: neutral[0],
        },
        error:   { main: status.danger.main },
        warning: { main: status.warning.main },
        info:    { main: status.info.main },
        success: { main: status.success.main },
        background: {
            default: surface.page,
            paper:   surface.card,
        },
        text: {
            primary:   text.heading,
            secondary: text.muted,
            disabled:  text.subtle,
        },
        divider: border.subtle,
        grey: {
            50:  neutral[50],
            100: neutral[100],
            200: neutral[200],
            300: neutral[300],
            400: neutral[400],
            500: neutral[500],
            600: neutral[600],
            700: neutral[700],
            800: neutral[800],
            900: neutral[900],
        },
        brand,
        gold,
        surface,
        border,
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
        subtitle2: { fontSize: '0.8rem', fontWeight: 500, lineHeight: 1.5, color: text.muted },
        body1: { fontSize: '0.825rem', lineHeight: 1.6 },
        body2: { fontSize: '0.8rem', lineHeight: 1.6 },
        caption: { fontSize: '0.7rem', lineHeight: 1.5, color: text.muted },
        overline: { fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' },
        button: { textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.01em' },
    },

    shape: {
        borderRadius: radii.md,
    },

    shadows: [
        'none',
        '0px 1px 2px rgba(0, 0, 0, 0.06)',
        elevation.card,
        elevation.raised,
        '0px 10px 15px -3px rgba(0, 0, 0, 0.07), 0px 4px 6px -2px rgba(0, 0, 0, 0.04)',
        '0px 20px 25px -5px rgba(0, 0, 0, 0.08), 0px 10px 10px -5px rgba(0, 0, 0, 0.03)',
        elevation.overlay,
        '0px 1px 2px rgba(0, 0, 0, 0.06)',
        '0px 1px 3px rgba(0, 0, 0, 0.08)',
        '0px 4px 6px -1px rgba(0, 0, 0, 0.07)',
        '0px 10px 15px -3px rgba(0, 0, 0, 0.07)',
        '0px 20px 25px -5px rgba(0, 0, 0, 0.08)',
        elevation.overlay,
        '0px 1px 2px rgba(0, 0, 0, 0.06)',
        '0px 1px 3px rgba(0, 0, 0, 0.08)',
        '0px 4px 6px -1px rgba(0, 0, 0, 0.07)',
        '0px 10px 15px -3px rgba(0, 0, 0, 0.07)',
        '0px 20px 25px -5px rgba(0, 0, 0, 0.08)',
        elevation.overlay,
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
                    backgroundColor: surface.page,
                },
                '::-webkit-scrollbar': {
                    width: '6px',
                    height: '6px',
                },
                '::-webkit-scrollbar-track': {
                    background: surface.subtle,
                },
                '::-webkit-scrollbar-thumb': {
                    background: alpha(brand[500], 0.35),
                    borderRadius: '3px',
                    '&:hover': {
                        background: alpha(brand[500], 0.55),
                    },
                },
                '::selection': {
                    background: alpha(brand[500], 0.2),
                    color: brand[700],
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
                        outline: `2px solid ${alpha(brand[500], 0.5)}`,
                        outlineOffset: 2,
                    },
                },
                contained: {
                    boxShadow: `0 1px 3px ${alpha(brand[500], 0.3)}, 0 1px 2px ${alpha(brand[500], 0.2)}`,
                    '&:hover': {
                        boxShadow: `0 4px 12px ${alpha(brand[500], 0.35)}`,
                        transform: 'translateY(-1px)',
                    },
                    '&:active': {
                        transform: 'translateY(0)',
                        boxShadow: `0 1px 3px ${alpha(brand[500], 0.3)}`,
                    },
                },
                outlined: {
                    borderWidth: '1.5px',
                    '&:hover': {
                        borderWidth: '1.5px',
                        backgroundColor: alpha(brand[500], 0.04),
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
                    borderRadius: radii.lg,
                    border: `1px solid ${border.subtle}`,
                    boxShadow: elevation.card,
                    transition: 'box-shadow 0.25s ease, transform 0.25s ease',
                },
            },
        },

        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: radii.lg,
                },
                elevation1: {
                    boxShadow: elevation.card,
                },
                elevation2: {
                    boxShadow: elevation.raised,
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
                        backgroundColor: surface.card,
                        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                        '& fieldset': {
                            borderColor: border.subtle,
                            borderWidth: '1.5px',
                            transition: 'border-color 0.2s ease',
                        },
                        '&:hover fieldset': {
                            borderColor: alpha(brand[500], 0.4),
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: brand[500],
                            borderWidth: '2px',
                        },
                        '&.Mui-focused': {
                            boxShadow: `0 0 0 3px ${alpha(brand[500], 0.12)}`,
                        },
                        '&.Mui-error fieldset': {
                            borderColor: status.danger.main,
                        },
                        '&.Mui-disabled': {
                            backgroundColor: surface.muted,
                        },
                    },
                    '& .MuiInputLabel-root': {
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        '&.Mui-focused': {
                            color: brand[500],
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
                    borderRadius: radii.sm,
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
                    backgroundColor: surface.inverse,
                    color: neutral[50],
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    borderRadius: radii.sm,
                    padding: '6px 10px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
                arrow: {
                    color: surface.inverse,
                },
            },
        },

        MuiDivider: {
            styleOverrides: {
                root: {
                    borderColor: border.subtle,
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
                    borderRadius: radii.xl,
                    boxShadow: elevation.overlay,
                },
            },
        },

        MuiMenu: {
            styleOverrides: {
                paper: {
                    borderRadius: radii.md,
                    border: `1px solid ${border.subtle}`,
                    boxShadow: elevation.floating,
                    marginTop: 4,
                },
            },
        },

        MuiMenuItem: {
            styleOverrides: {
                root: {
                    borderRadius: radii.sm,
                    margin: '2px 6px',
                    fontSize: '0.875rem',
                    transition: 'background-color 0.15s ease',
                    '&:hover': {
                        backgroundColor: alpha(brand[500], 0.06),
                    },
                    '&.Mui-selected': {
                        backgroundColor: alpha(brand[500], 0.1),
                        fontWeight: 600,
                        '&:hover': {
                            backgroundColor: alpha(brand[500], 0.14),
                        },
                    },
                },
            },
        },

        MuiPopover: {
            styleOverrides: {
                paper: {
                    borderRadius: radii.md,
                    border: `1px solid ${border.subtle}`,
                    boxShadow: elevation.floating,
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
                    backgroundColor: alpha(brand[500], 0.12),
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
                        backgroundColor: alpha(brand[500], 0.08),
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
                    borderRadius: radii.md,
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
                    backgroundColor: neutral[300],
                },
            },
        },

        MuiFormLabel: {
            styleOverrides: {
                root: {
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: neutral[700],
                    '&.Mui-focused': {
                        color: brand[500],
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
