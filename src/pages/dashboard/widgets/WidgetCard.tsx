/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ReactNode } from 'react';
import { Box, IconButton, Paper, Skeleton, Stack, Tooltip, Typography, alpha } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloudOffOutlinedIcon from '@mui/icons-material/CloudOffOutlined';
import { brand, border, elevation, neutral, radii, surface } from '../../../utils/tokens';
import { EmptyState } from '../../../components/layout';

export interface IWidgetCardProps {
    title: string;
    /** One line of context under the title — usually what the number is scoped to. */
    subtitle?: string;
    icon?: ReactNode;
    /** Explanation behind a help icon, for metrics whose definition is not obvious. */
    helpText?: string;
    /** Right-hand slot — filters, toggles, a "view all" link. */
    actions?: ReactNode;
    /** Fixed body height so the page does not reflow as each widget's data lands. */
    height?: number;
    loading?: boolean;
    /** The fetch failed. Shown instead of the body, because zeros would read as real data. */
    failed?: boolean;
    onRetry?: () => void;
    /** No rows came back — a legitimately empty result, distinct from a failure. */
    empty?: boolean;
    emptyTitle?: string;
    emptyDescription?: string;
    children: ReactNode;
}

/**
 * Shared chrome for every dashboard widget.
 *
 * Exists so the four states a widget can be in — loading, failed, empty, populated — look the
 * same everywhere, and so no widget invents its own card border, header weight or skeleton.
 * Previously each section rolled its own; only one had skeletons at all, so the page assembled
 * in a jumble as calls resolved at different times.
 */
const WidgetCard = ({
    title,
    subtitle,
    icon,
    helpText,
    actions,
    height,
    loading = false,
    failed = false,
    onRetry,
    empty = false,
    emptyTitle = 'Nothing to show yet',
    emptyDescription,
    children,
}: IWidgetCardProps) => (
    <Paper
        elevation={0}
        sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: `${radii.lg}px`,
            border: `1px solid ${border.subtle}`,
            bgcolor: surface.card,
            boxShadow: elevation.card,
            overflow: 'hidden',
        }}
    >
        <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{
                px: 2.5,
                py: 1.75,
                borderBottom: `1px solid ${border.subtle}`,
                bgcolor: surface.muted,
            }}
        >
            {icon && (
                <Box
                    sx={{
                        width: 30,
                        height: 30,
                        borderRadius: 1,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: brand[600],
                        bgcolor: alpha(brand[500], 0.09),
                        '& .MuiSvgIcon-root': { fontSize: 18 },
                    }}
                >
                    {icon}
                </Box>
            )}
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: neutral[900], lineHeight: 1.35 }}
                    noWrap
                >
                    {title}
                </Typography>
                {subtitle && (
                    <Typography variant="caption" sx={{ color: neutral[500] }} noWrap display="block">
                        {subtitle}
                    </Typography>
                )}
            </Box>
            {helpText && (
                <Tooltip title={helpText} arrow placement="top">
                    <IconButton size="small" sx={{ flexShrink: 0 }}>
                        <HelpOutlineIcon fontSize="small" sx={{ color: neutral[400] }} />
                    </IconButton>
                </Tooltip>
            )}
            {actions && <Box sx={{ flexShrink: 0, display: 'flex', gap: 1 }}>{actions}</Box>}
        </Stack>

        <Box sx={{ p: 2.5, flexGrow: 1, minHeight: height, display: 'flex', flexDirection: 'column' }}>
            {loading && (
                <Stack spacing={1.25} sx={{ flexGrow: 1 }}>
                    <Skeleton variant="rounded" height={28} width="45%" />
                    <Skeleton variant="rounded" sx={{ flexGrow: 1, minHeight: 120 }} />
                </Stack>
            )}

            {!loading && failed && (
                <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ flexGrow: 1, py: 4, textAlign: 'center' }}>
                    <CloudOffOutlinedIcon sx={{ fontSize: 32, color: neutral[400] }} />
                    <Typography variant="body2" sx={{ color: neutral[600], fontWeight: 600 }}>
                        Couldn't load this data
                    </Typography>
                    <Typography variant="caption" sx={{ color: neutral[500], maxWidth: 260 }}>
                        The figures are unavailable right now. They are not zero — nothing was returned.
                    </Typography>
                    {onRetry && (
                        <IconButton size="small" onClick={onRetry} sx={{ mt: 0.5, color: brand[600] }}>
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    )}
                </Stack>
            )}

            {!loading && !failed && empty && (
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <EmptyState variant="inline" title={emptyTitle} description={emptyDescription} />
                </Box>
            )}

            {!loading && !failed && !empty && children}
        </Box>
    </Paper>
);

export default WidgetCard;
