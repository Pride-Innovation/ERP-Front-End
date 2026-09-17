/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import { Box, Divider, Typography } from '@mui/material';
import HorizontalLogo from '../../statics/images/pride_logo_horizontal.png';

/**
 * The auth pages' card — the MUI sign-up template recipe: a single self-centred
 * column, 32px padding, 16px gaps, capped at 450px from `sm`, floating on the
 * page gradient with layered hsla shadows.
 */
export const AuthCard = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: 'auto',
    borderRadius: 12,
    border: '1px solid #E6EAF0',
    backgroundColor: '#fff',
    boxShadow:
        'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
    [theme.breakpoints.up('sm')]: {
        width: '450px',
    },
}));

/** Brand mark at the top of the card (the template's Sitemark slot). */
export const AuthLogo = () => (
    <Box
        component="img"
        src={HorizontalLogo}
        alt="Pride Bank"
        sx={{ height: 34, alignSelf: 'flex-start', objectFit: 'contain' }}
    />
);

/** Fluid page heading + optional supporting line, per the template's h1 clamp. */
export const AuthHeading = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <Box>
        <Typography
            component="h1"
            variant="h4"
            sx={{
                width: '100%',
                fontWeight: 700,
                color: '#0F172A',
                fontSize: 'clamp(1.7rem, 8vw, 2rem)',
                lineHeight: 1.2,
            }}
        >
            {title}
        </Typography>
        {subtitle && (
            <Typography variant="body2" sx={{ color: '#64748B', mt: 0.75, lineHeight: 1.6 }}>
                {subtitle}
            </Typography>
        )}
    </Box>
);

/** Divider + copyright footer shared by every auth card. */
export const AuthFooter = () => (
    <>
        <Divider sx={{ borderColor: '#EEF2F7' }} />
        <Typography variant="caption" sx={{ textAlign: 'center', color: '#94A3B8' }}>
            &copy; {new Date().getFullYear()} Pride Bank Limited. All Rights Reserved.
        </Typography>
    </>
);
