/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ReactNode } from 'react';
import { Box, Divider, Stack, Typography, alpha } from '@mui/material';
import { brand, neutral, border, surface, elevation, radii } from '../../utils/tokens';

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
 * Anchor-page hero. A calm white card where typography and spacing carry the
 * hierarchy; brand colour appears only in the icon tile. Use for module
 * landing pages (Assets, Settings, Movements, Dashboard, Inventory). For
 * ordinary list/detail pages, prefer the calmer `<PageShell>`.
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
            borderRadius: `${radii.lg}px`,
            border: `1px solid ${border.subtle}`,
            bgcolor: surface.card,
            boxShadow: elevation.card,
            overflow: 'hidden',
            mb: 3,
        }}
    >
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
                                bgcolor: alpha(brand[500], 0.08),
                                border: `1px solid ${alpha(brand[500], 0.18)}`,
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
                            sx={{
                                color: neutral[900],
                                fontWeight: 700,
                                lineHeight: 1.2,
                                letterSpacing: '-0.01em',
                            }}
                            noWrap
                        >
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography
                                variant="body2"
                                sx={{ color: neutral[500], mt: 0.5 }}
                            >
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                </Stack>

                {(stat || actions) && (
                    <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}
                    >
                        {actions}
                        {stat && actions && (
                            <Divider
                                orientation="vertical"
                                flexItem
                                sx={{ borderColor: border.subtle, display: { xs: 'none', sm: 'block' } }}
                            />
                        )}
                        {stat && (
                            <Box
                                sx={{
                                    textAlign: 'right',
                                    display: { xs: 'none', sm: 'block' },
                                    minWidth: 72,
                                }}
                            >
                                <Typography
                                    variant="h5"
                                    sx={{
                                        color: neutral[900],
                                        fontWeight: 800,
                                        lineHeight: 1,
                                        letterSpacing: '-0.01em',
                                        fontVariantNumeric: 'tabular-nums',
                                    }}
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
                                            mt: 0.25,
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
                <Box
                    sx={{
                        mx: { xs: -2.5, md: -3.5 },
                        px: { xs: 2.5, md: 3.5 },
                        borderTop: `1px solid ${border.subtle}`,
                        bgcolor: surface.muted,
                    }}
                >
                    {tabs}
                </Box>
            )}
        </Box>
    </Box>
);

export default PageHero;
