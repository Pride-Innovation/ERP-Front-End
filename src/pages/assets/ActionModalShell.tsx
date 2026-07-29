/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ReactNode } from 'react';
import {
    Avatar,
    Box,
    Button as MuiButton,
    Divider,
    Paper,
    Stack,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { IAsset } from './interface';

/**
 * Shared chrome for the asset action modals (Reassign / Repair / Dispose / Receive into Store).
 *
 * <p>They previously each rolled their own layout — an accent bar, a differently-tinted header and a
 * column of rainbow-coloured icon tiles per field — so four dialogs doing comparable things looked
 * like four different products. This mirrors the user-account modals instead: one tinted header band
 * carrying the action's severity, plain content, then a divider above right-aligned actions. Colour
 * is used once, to say how serious the action is, rather than decoratively on every row.
 */

export type ActionTone = 'primary' | 'error' | 'success' | 'info' | 'warning';

interface ShellProps {
    tone?: ActionTone;
    icon: ReactNode;
    title: string;
    subtitle?: string;
    children: ReactNode;
    onCancel: () => void;
    onConfirm: () => void;
    confirmText: string;
    confirmIcon?: ReactNode;
    /** Disables both buttons and swaps the confirm label for `busyText`. */
    busy?: boolean;
    busyText?: string;
    /** Blocks confirm without implying work is in flight (e.g. a required field is empty). */
    confirmDisabled?: boolean;
    /** Caps the body height so a long form scrolls inside the dialog, header and actions pinned. */
    scrollBody?: boolean;
}

const ActionModalShell = ({
    tone = 'primary',
    icon,
    title,
    subtitle,
    children,
    onCancel,
    onConfirm,
    confirmText,
    confirmIcon,
    busy = false,
    busyText,
    confirmDisabled = false,
    scrollBody = false,
}: ShellProps) => {
    const theme = useTheme();
    const accent = theme.palette[tone];

    return (
        <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            {/* Header — the single place the action's severity is expressed */}
            <Box
                sx={{
                    p: 2.5,
                    bgcolor: alpha(accent.dark, 0.08),
                    borderBottom: `1px solid ${alpha(accent.dark, 0.2)}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <Avatar sx={{ bgcolor: alpha(accent.dark, 0.12), color: accent.dark, width: 40, height: 40 }}>
                    {icon}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h6" sx={{ color: accent.dark, fontWeight: 600, lineHeight: 1.3 }}>
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography variant="body2" color="text.secondary">
                            {subtitle}
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* Content */}
            <Box
                sx={{
                    p: 3,
                    ...(scrollBody ? { maxHeight: '68vh', overflowY: 'auto' } : {}),
                }}
            >
                {children}
            </Box>

            <Divider />

            {/* Actions */}
            <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ p: 2 }}>
                <MuiButton
                    variant="outlined"
                    color="inherit"
                    onClick={onCancel}
                    disabled={busy}
                    sx={{ minWidth: 100, textTransform: 'none', fontWeight: 600 }}
                >
                    Cancel
                </MuiButton>
                <MuiButton
                    variant="contained"
                    color={tone}
                    startIcon={confirmIcon}
                    onClick={onConfirm}
                    disabled={busy || confirmDisabled}
                    sx={{ minWidth: 140, textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
                >
                    {busy && busyText ? busyText : confirmText}
                </MuiButton>
            </Stack>
        </Paper>
    );
};

/**
 * One compact identity card for the asset being acted on — the counterpart of the user card in the
 * account modals. Replaces the per-field coloured icon tiles: the secondary line carries engraved
 * number, location and holder, which is all the confirmation actually needs.
 */
export const AssetIdentityCard = ({ asset, extra }: { asset: IAsset; extra?: ReactNode }) => {
    const theme = useTheme();

    const holder = asset?.assignedTo
        ? `${asset.assignedTo.firstName ?? ''} ${asset.assignedTo.lastName ?? ''}`.trim()
        : '';

    const meta = [
        asset?.engravedNumber || 'No engraved number',
        asset?.branch?.name,
        holder ? `Held by ${holder}` : null,
    ].filter(Boolean);

    return (
        <Box
            sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.grey[500], 0.06),
                border: `1px solid ${alpha(theme.palette.grey[500], 0.15)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
            }}
        >
            <Avatar
                variant="rounded"
                sx={{ width: 48, height: 48, bgcolor: theme.palette.primary.main, color: '#fff' }}
            >
                <Inventory2OutlinedIcon />
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight={600} noWrap>
                    {asset?.assetName || 'Unnamed asset'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {meta.join('  |  ')}
                </Typography>
                {extra}
            </Box>
        </Box>
    );
};

/**
 * The "this action will…" bullets, styled like the account modals' accent-bordered list so the
 * consequences of a destructive or state-changing action are stated before it is taken.
 */
export const ActionPoints = ({ tone = 'primary', points }: { tone?: ActionTone; points: ReactNode[] }) => {
    const theme = useTheme();
    return (
        <Box sx={{ ml: 2, pl: 2, borderLeft: `3px solid ${alpha(theme.palette[tone].main, 0.5)}` }}>
            {points.map((point, i) => (
                <Typography
                    key={i}
                    variant="body2"
                    sx={{ color: 'text.primary', mb: i === points.length - 1 ? 0 : 1 }}
                >
                    • {point}
                </Typography>
            ))}
        </Box>
    );
};

/** Label/value rows for asset facts that don't belong on the identity line (used by Repair). */
export const DetailRows = ({ rows }: { rows: Array<{ label: string; value?: ReactNode }> }) => (
    <Stack spacing={1.5}>
        {rows
            .filter((r) => r.value !== undefined && r.value !== null && r.value !== '')
            .map((r) => (
                <Box key={r.label}>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        {r.label}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="text.primary">
                        {r.value}
                    </Typography>
                </Box>
            ))}
    </Stack>
);

export default ActionModalShell;
