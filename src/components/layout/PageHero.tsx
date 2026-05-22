/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ReactNode } from 'react';
import { Box, Stack, Typography, alpha } from '@mui/material';
import { brand, neutral, border } from '../../utils/tokens';

export interface IPageHeroStat {
    /** The value rendered large (string or number — formatted by the caller). */
    value: string | number;
    /** Label rendered below the value (e.g. "records"). */
    label?: string;
    /** Optional helper text shown below the label (e.g. a date). */
    helper?: string;
}

export interface IPageHeroProps {
    title: string;
    subtitle?: string;
    /** Icon rendered inside a soft brand-tinted tile. */
    icon?: ReactNode;
    /** Optional stat displayed on the right edge of the hero. */
    stat?: IPageHeroStat;
    /** Optional `<Tabs>` rendered along the bottom of the hero. */
    tabs?: ReactNode;
    /** Right-side actions slot — used instead of (or alongside) `stat`. */
    actions?: ReactNode;
}

/**
 * Anchor-page hero. Light, brand-tinted surface with a 3px brand bar on the
 * left edge. Use for module landing pages (Assets, Settings, Movements,
 * Dashboard, Inventory). For ordinary list/detail pages, prefer the calmer
 * `<PageShell>`.
 */
const PageHero = ({
    title,
    subtitle,
    icon,
    stat,
    tabs,
    actions,
}: IPageHeroProps) => (
    <Box
        sx={{
            position: 'relative',
            borderRadius: 2,
            border: `1px solid ${border.subtle}`,
            background: `linear-gradient(135deg, ${alpha(brand[50], 0.6)} 0%, #FFFFFF 60%)`,
            overflow: 'hidden',
            mb: 3,
        }}
    >
        {/* 3px brand bar on the left edge */}
        <Box
            sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 3,
                background: `linear-gradient(180deg, ${brand[500]} 0%, ${brand[700]} 100%)`,
            }}
        />

        <Box sx={{ px: { xs: 2.5, md: 3.5 }, pt: 2.5, pb: tabs ? 0 : 2.5 }}>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
                sx={{ mb: tabs ? 2.25 : 0 }}
            >
                <Stack direction="row" alignItems="center" gap={2} sx={{ minWidth: 0 }}>
                    {icon && (
                        <Box
                            sx={{
                                width: 44,
                                height: 44,
                                borderRadius: 1.5,
                                bgcolor: alpha(brand[500], 0.1),
                                color: brand[600],
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                '& .MuiSvgIcon-root': { fontSize: 22, color: brand[600] },
                            }}
                        >
                            {icon}
                        </Box>
                    )}
                    <Box sx={{ minWidth: 0 }}>
                        <Typography
                            variant="h5"
                            sx={{ color: neutral[900], fontWeight: 700, lineHeight: 1.2 }}
                            noWrap
                        >
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography
                                variant="body2"
                                sx={{ color: neutral[500], mt: 0.25 }}
                            >
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                </Stack>

                {(stat || actions) && (
                    <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}
                    >
                        {actions}
                        {stat && (
                            <Box
                                sx={{
                                    px: 2.25,
                                    py: 1,
                                    bgcolor: '#fff',
                                    border: `1px solid ${border.subtle}`,
                                    borderRadius: 1.5,
                                    textAlign: 'right',
                                    display: { xs: 'none', sm: 'block' },
                                    minWidth: 96,
                                }}
                            >
                                <Typography
                                    variant="h5"
                                    sx={{ color: neutral[900], fontWeight: 800, lineHeight: 1 }}
                                >
                                    {stat.value}
                                </Typography>
                                {stat.label && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: neutral[500],
                                            fontWeight: 600,
                                            display: 'block',
                                            mt: 0.5,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.06em',
                                            fontSize: '0.6rem',
                                        }}
                                    >
                                        {stat.label}
                                    </Typography>
                                )}
                                {stat.helper && (
                                    <Typography
                                        sx={{
                                            color: neutral[400],
                                            fontSize: '0.65rem',
                                            display: 'block',
                                            mt: 0.5,
                                        }}
                                    >
                                        {stat.helper}
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Stack>
                )}
            </Stack>

            {tabs && (
                <Box sx={{ mx: { xs: -2.5, md: -3.5 }, px: { xs: 2.5, md: 3.5 }, borderTop: `1px solid ${border.subtle}` }}>
                    {tabs}
                </Box>
            )}
        </Box>
    </Box>
);

export default PageHero;
