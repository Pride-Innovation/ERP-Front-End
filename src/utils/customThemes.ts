/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { createTheme } from '@mui/material/styles';

const customThemes = createTheme({
    palette: {
        primary: {
            main: '#08796C', // Your brand green
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#004D40',
        },
        error: {
            main: '#D32F2F',
        },
        warning: {
            main: '#FFA000',
        },
        info: {
            main: '#0288D1',
        },
        success: {
            main: '#08796C',
        },
        background: {
            default: '#F5F5F5',
            paper: '#FFFFFF',
        },
        text: {
            primary: '#1B1B1B',
            secondary: '#757575',
        },
    },

    typography: {
        fontFamily: 'Roboto, sans-serif',
        h1: { fontSize: '2.25rem', fontWeight: 700 },
        h2: { fontSize: '1.75rem', fontWeight: 600 },
        h3: { fontSize: '1.5rem', fontWeight: 600 },
        body1: { fontSize: '1rem', lineHeight: 1.5 },
        button: { textTransform: 'none', fontWeight: 500 },
    },

});

export default customThemes;
