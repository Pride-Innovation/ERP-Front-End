/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Button, Chip, Grid, Paper, Stack, Typography, alpha } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import { ROUTES } from '../../../core/routes/routes';
import { brand, gold, neutral, border } from '../../../utils/tokens';

/** Feature preview tiles — what the module will offer at launch. */
const UPCOMING_FEATURES = [
    {
        icon: <DirectionsCarFilledOutlinedIcon />,
        title: 'Request a Vehicle',
        description: 'Raise transport requests for field visits, deliveries and official travel — right from your desk.',
    },
    {
        icon: <FactCheckOutlinedIcon />,
        title: 'Streamlined Approvals',
        description: 'Requests flow through your existing approval chain with full visibility at every step.',
    },
    {
        icon: <EventAvailableOutlinedIcon />,
        title: 'Trip Scheduling',
        description: 'See vehicle availability at a glance and schedule trips without the back-and-forth.',
    },
    {
        icon: <InsightsOutlinedIcon />,
        title: 'Fleet Insights',
        description: 'Utilisation and trip reports to help the bank plan its fleet with real data.',
    },
];

/** Honest development-status strip. */
const ROADMAP = [
    { icon: <CheckCircleIcon />, label: 'Designed', done: true },
    { icon: <BuildCircleOutlinedIcon />, label: 'In Development', done: false, current: true },
    { icon: <RocketLaunchOutlinedIcon />, label: 'Launch', done: false },
];

/**
 * Placeholder for the Transport Requests module while its backend is being
 * built. Replaces the data-driven pages on this route so users see a friendly
 * preview instead of failed-request errors.
 */
const TransportComingSoon = () => {
    const navigate = useNavigate();

    return (
        <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }, maxWidth: 1100, mx: 'auto' }}>
            {/* ── Hero ── */}
            <Paper
                elevation={0}
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 3,
                    border: `1px solid ${border.subtle}`,
                    background: `linear-gradient(135deg, ${alpha(brand[50], 0.9)} 0%, #FFFFFF 55%, ${alpha(gold[50], 0.7)} 100%)`,
                    px: { xs: 3, md: 6 },
                    py: { xs: 5, md: 7 },
                    textAlign: 'center',
                }}
            >
                {/* Decorative brand circles */}
                <Box sx={{ position: 'absolute', top: -70, right: -70, width: 220, height: 220, borderRadius: '50%', bgcolor: alpha(brand[500], 0.06) }} />
                <Box sx={{ position: 'absolute', bottom: -90, left: -60, width: 260, height: 260, borderRadius: '50%', bgcolor: alpha(gold[500], 0.07) }} />
                <Box sx={{ position: 'absolute', top: 40, left: '18%', width: 14, height: 14, borderRadius: '50%', bgcolor: alpha(brand[400], 0.25) }} />
                <Box sx={{ position: 'absolute', bottom: 56, right: '20%', width: 10, height: 10, borderRadius: '50%', bgcolor: alpha(gold[400], 0.35) }} />

                <Stack alignItems="center" spacing={2.5} sx={{ position: 'relative' }}>
                    {/* Icon tile with animated pulse ring */}
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <Box
                            sx={{
                                position: 'absolute',
                                inset: -10,
                                borderRadius: '50%',
                                border: `2px solid ${alpha(brand[500], 0.25)}`,
                                animation: 'transportPulse 2.4s ease-out infinite',
                                '@keyframes transportPulse': {
                                    '0%': { transform: 'scale(0.85)', opacity: 0.9 },
                                    '70%': { transform: 'scale(1.25)', opacity: 0 },
                                    '100%': { transform: 'scale(1.25)', opacity: 0 },
                                },
                            }}
                        />
                        <Box
                            sx={{
                                width: 84,
                                height: 84,
                                borderRadius: '50%',
                                background: `linear-gradient(135deg, ${brand[500]} 0%, ${brand[700]} 100%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: `0 12px 28px ${alpha(brand[500], 0.35)}`,
                                '& .MuiSvgIcon-root': { fontSize: 42, color: '#fff' },
                            }}
                        >
                            <LocalShippingOutlinedIcon />
                        </Box>
                    </Box>

                    <Chip
                        label="COMING SOON"
                        size="small"
                        sx={{
                            fontWeight: 700,
                            letterSpacing: '0.12em',
                            fontSize: '0.68rem',
                            color: gold[800],
                            bgcolor: alpha(gold[500], 0.14),
                            border: `1px solid ${alpha(gold[500], 0.35)}`,
                        }}
                    />

                    <Typography variant="h4" sx={{ fontWeight: 800, color: neutral[900], maxWidth: 620 }}>
                        Transport Requests are on the way
                    </Typography>

                    <Typography variant="body1" sx={{ color: neutral[500], maxWidth: 560, lineHeight: 1.7 }}>
                        We're building a smarter way to request, approve and track official
                        transport across Pride Bank. This module is under active development
                        and will appear right here the moment it's ready — no update needed
                        on your side.
                    </Typography>

                    {/* Roadmap strip */}
                    <Stack
                        direction="row"
                        spacing={{ xs: 2, sm: 4 }}
                        sx={{ pt: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}
                    >
                        {ROADMAP.map((step) => (
                            <Stack key={step.label} direction="row" alignItems="center" spacing={0.75}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        color: step.done
                                            ? brand[500]
                                            : step.current
                                                ? gold[600]
                                                : neutral[300],
                                        '& .MuiSvgIcon-root': { fontSize: 20 },
                                    }}
                                >
                                    {step.icon}
                                </Box>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontWeight: 700,
                                        color: step.done ? neutral[700] : step.current ? gold[800] : neutral[400],
                                        letterSpacing: '0.04em',
                                    }}
                                >
                                    {step.label}
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>

                    {/* Actions */}
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.5}
                        sx={{ pt: 2, width: { xs: '100%', sm: 'auto' } }}
                    >
                        <Button
                            variant="contained"
                            startIcon={<SpaceDashboardOutlinedIcon />}
                            onClick={() => navigate(ROUTES.ASSETS_MANAGEMENT)}
                            sx={{
                                height: 42,
                                px: 3,
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 600,
                                bgcolor: brand[500],
                                boxShadow: `0 2px 8px ${alpha(brand[500], 0.3)}`,
                                '&:hover': { bgcolor: brand[700], boxShadow: `0 4px 14px ${alpha(brand[500], 0.4)}` },
                            }}
                        >
                            Back to Dashboard
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<SwapHorizOutlinedIcon />}
                            onClick={() => navigate(ROUTES.MOVEMENT)}
                            sx={{
                                height: 42,
                                px: 3,
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 600,
                                borderColor: alpha(brand[500], 0.4),
                                color: brand[600],
                                '&:hover': { borderColor: brand[500], bgcolor: alpha(brand[500], 0.05) },
                            }}
                        >
                            Explore Asset Movements
                        </Button>
                    </Stack>
                </Stack>
            </Paper>

            {/* ── Feature preview ── */}
            <Typography
                variant="overline"
                sx={{
                    display: 'block',
                    textAlign: 'center',
                    color: neutral[400],
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    mt: 5,
                    mb: 2,
                }}
            >
                What to expect at launch
            </Typography>

            <Grid container spacing={2.5}>
                {UPCOMING_FEATURES.map((feature) => (
                    <Grid item xs={12} sm={6} md={3} key={feature.title}>
                        <Paper
                            elevation={0}
                            sx={{
                                height: '100%',
                                p: 2.5,
                                borderRadius: 2.5,
                                border: `1px solid ${border.subtle}`,
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                                '&:hover': {
                                    transform: 'translateY(-3px)',
                                    borderColor: alpha(brand[500], 0.35),
                                    boxShadow: `0 10px 24px ${alpha(brand[500], 0.12)}`,
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 1.5,
                                    bgcolor: alpha(brand[500], 0.1),
                                    color: brand[600],
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 1.5,
                                    '& .MuiSvgIcon-root': { fontSize: 22 },
                                }}
                            >
                                {feature.icon}
                            </Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: neutral[900], mb: 0.5 }}>
                                {feature.title}
                            </Typography>
                            <Typography variant="body2" sx={{ color: neutral[500], lineHeight: 1.6 }}>
                                {feature.description}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            {/* ── Footnote ── */}
            <Typography
                variant="caption"
                sx={{ display: 'block', textAlign: 'center', color: neutral[400], mt: 4 }}
            >
                Have ideas for this module? Share them with the ERP team — we're building it for you.
            </Typography>
        </Box>
    );
};

export default TransportComingSoon;
