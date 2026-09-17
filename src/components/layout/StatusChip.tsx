/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ReactNode } from 'react';
import { Chip, alpha } from '@mui/material';
import { brand, gold, neutral, status } from '../../utils/tokens';

/** Canonical request/workflow status tones, plus a `neutral` catch-all. */
export type StatusTone =
    | 'success'   // approved, issued, completed, active, acknowledged
    | 'pending'   // pending, awaiting, in-progress
    | 'danger'    // rejected, failed, blocked, disposed
    | 'info'      // informational
    | 'brand'     // brand-flavoured highlight
    | 'gold'      // secondary highlight
    | 'neutral';  // inactive, draft, unset

export interface IStatusChipProps {
    /** Label shown inside the chip. */
    label: string;
    /** Visual tone — pick the closest semantic. Defaults to `neutral`. */
    tone?: StatusTone;
    /** Optional leading icon. */
    icon?: ReactNode;
    /** Use `outlined` for a calmer look (dashed/filled border, transparent fill). Default `soft`. */
    variant?: 'soft' | 'outlined';
    /** Size — `sm` is the default 18px; `md` matches MUI default. */
    size?: 'sm' | 'md';
}

interface ToneStyle {
    fg: string;
    bg: string;
    border: string;
}

const TONE_STYLES: Record<StatusTone, ToneStyle> = {
    success: { fg: status.success.strong, bg: status.success.soft, border: status.success.main },
    pending: { fg: status.warning.strong, bg: status.warning.soft, border: status.warning.main },
    danger:  { fg: status.danger.strong,  bg: status.danger.soft,  border: status.danger.main },
    info:    { fg: status.info.strong,    bg: status.info.soft,    border: status.info.main },
    brand:   { fg: brand[700],            bg: alpha(brand[500], 0.1),  border: brand[500] },
    gold:    { fg: gold[700],             bg: alpha(gold[500], 0.12),  border: gold[500] },
    neutral: { fg: neutral[700],          bg: neutral[100],            border: neutral[300] },
};

/**
 * Semantic status indicator. Use instead of hand-rolling colour pairs on each page.
 *
 *   <StatusChip label="Approved" tone="success" />
 *   <StatusChip label="Pending"  tone="pending" />
 *   <StatusChip label="Inactive" tone="neutral" variant="outlined" />
 */
const StatusChip = ({
    label,
    tone = 'neutral',
    icon,
    variant = 'soft',
    size = 'sm',
}: IStatusChipProps) => {
    const t = TONE_STYLES[tone];

    return (
        <Chip
            label={label}
            icon={icon as any}
            size={size === 'sm' ? 'small' : 'medium'}
            sx={{
                bgcolor: variant === 'soft' ? t.bg : 'transparent',
                color: t.fg,
                border: variant === 'outlined' ? `1px solid ${alpha(t.border, 0.5)}` : 'none',
                fontWeight: 600,
                letterSpacing: 0.2,
                '& .MuiChip-icon': { color: t.fg, marginLeft: '6px' },
            }}
        />
    );
};

export default StatusChip;
