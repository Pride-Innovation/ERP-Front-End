/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ReactNode } from 'react';
import { Box, Paper, Stack, Tooltip, Typography, alpha } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { brand, gold, neutral, status } from '../../utils/tokens';

export interface IStatTileTrend {
    /** A number string like "+12.5%" or "−3.2 pts" — rendered verbatim. */
    value: string;
    /** Direction; styles the trend chip. */
    direction: 'up' | 'down' | 'flat';
    /** Optional helper text (e.g. "vs. last week") shown after the value. */
    period?: string;
}

export interface IStatTileProps {
    /** Headline label, e.g. "Pending Requests". */
    label: string;
    /** The metric value — accepts string ("128") or number (128). */
    value: string | number;
    /** Optional one-line context shown below the value. */
    helper?: string;
    /** Tooltip explanation of the metric, shown on the label hover. */
    tooltip?: string;
    /** Optional icon — shown in a soft-coloured badge to the right of the metric. */
    icon?: ReactNode;
    /** Trend indicator block — chip with arrow + delta. */
    trend?: IStatTileTrend;
    /** Accent colour — tints the icon badge and selected trend states. */
    accent?: 'brand' | 'gold' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
    /** Click handler; when set, the tile renders as a button-like surface. */
    onClick?: () => void;
}

const ACCENT_MAP: Record<NonNullable<IStatTileProps['accent']>, string> = {
    brand:   brand[500],
    gold:    gold[500],
    success: status.success.main,
    warning: status.warning.main,
    danger:  status.danger.main,
    info:    status.info.main,
    neutral: neutral[500],
};

const TREND_ICON = {
    up:   <TrendingUpIcon sx={{ fontSize: 14 }} />,
    down: <TrendingDownIcon sx={{ fontSize: 14 }} />,
    flat: <TrendingFlatIcon sx={{ fontSize: 14 }} />,
};

const TREND_COLOR: Record<IStatTileTrend['direction'], string> = {
    up:   status.success.main,
    down: status.danger.main,
    flat: neutral[500],
};

const StatTile = ({
    label,
    value,
    helper,
    tooltip,
    icon,
    trend,
    accent = 'brand',
    onClick,
}: IStatTileProps) => {
    const accentColor = ACCENT_MAP[accent];
    const interactive = Boolean(onClick);

    return (
        <Paper
            variant="outlined"
            onClick={onClick}
            sx={{
                p: 2.25,
                borderRadius: 2,
                borderColor: neutral[200],
                cursor: interactive ? 'pointer' : 'default',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease',
                ...(interactive && {
                    '&:hover': {
                        borderColor: alpha(accentColor, 0.4),
                        boxShadow: `0 4px 12px ${alpha(accentColor, 0.08)}`,
                        transform: 'translateY(-1px)',
                    },
                }),
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
                <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                    <Tooltip title={tooltip ?? ''} arrow disableHoverListener={!tooltip} placement="top">
                        <Typography
                            variant="caption"
                            sx={{
                                color: neutral[500],
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                fontSize: '0.65rem',
                                cursor: tooltip ? 'help' : 'default',
                            }}
                        >
                            {label}
                        </Typography>
                    </Tooltip>
                    <Typography
                        variant="h5"
                        sx={{ fontWeight: 700, color: neutral[900], lineHeight: 1.2 }}
                    >
                        {value}
                    </Typography>
                    {helper && (
                        <Typography variant="caption" sx={{ color: neutral[500] }}>
                            {helper}
                        </Typography>
                    )}
                </Stack>
                {icon && (
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 1.5,
                            bgcolor: alpha(accentColor, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: accentColor,
                            flexShrink: 0,
                            '& .MuiSvgIcon-root': { fontSize: 20, color: accentColor },
                        }}
                    >
                        {icon}
                    </Box>
                )}
            </Stack>
            {trend && (
                <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 1.5 }}>
                    <Box
                        sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.4,
                            color: TREND_COLOR[trend.direction],
                            bgcolor: alpha(TREND_COLOR[trend.direction], 0.1),
                            borderRadius: 1,
                            px: 0.75,
                            py: 0.25,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                        }}
                    >
                        {TREND_ICON[trend.direction]}
                        {trend.value}
                    </Box>
                    {trend.period && (
                        <Typography variant="caption" sx={{ color: neutral[500] }}>
                            {trend.period}
                        </Typography>
                    )}
                </Stack>
            )}
        </Paper>
    );
};

export default StatTile;
