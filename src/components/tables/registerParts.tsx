/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { MouseEvent, ReactNode, useState } from 'react';
import {
    alpha, Box, CircularProgress, Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem,
    Tooltip, Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { border, brand, neutral } from '../../utils/tokens';
import { dataBodyCellSx, dataHeadCellSx } from './dataTableSx';

/**
 * The pieces the movement and consignment registers share, so the two halves of the module cannot
 * drift apart again — they were built to "read as one product" and had each copied the other's
 * styling by hand.
 *
 * <h2>Restraint is the design</h2>
 * Every cell is at most two lines — a value and a muted qualifier — and colour is kept for what a
 * reader scans for (status, an overdue date). Rows are separated by a hairline and a hover tint only;
 * zebra stripes and a hover rail on top of that were three separators doing one job.
 */

export const MONO = '"JetBrains Mono", ui-monospace, Menlo, Consolas, monospace';

/**
 * The one shape every register cell takes: a value, and optionally a muted qualifier beneath it.
 * Holding every column to this is what gives the rows a single height and the table one rhythm.
 */
export const TwoLine = ({ primary, secondary, mono, strong = true, hint = true }: {
    primary: ReactNode;
    secondary?: ReactNode;
    /** Set the qualifier in monospace — for tracking numbers and references. */
    mono?: boolean;
    strong?: boolean;
    /** Off where the cell already has a tooltip of its own, so hovering does not raise two. */
    hint?: boolean;
}) => (
    // The native title carries the full text wherever the column has had to ellipsise it.
    <Box
        sx={{ minWidth: 0 }}
        title={hint ? ([primary, secondary].filter((v) => typeof v === 'string').join(' · ') || undefined) : undefined}
    >
        <Typography
            noWrap
            sx={{ fontSize: '0.875rem', fontWeight: strong ? 600 : 500, color: neutral[800], lineHeight: 1.4 }}
        >
            {primary}
        </Typography>
        {secondary && (
            <Typography
                noWrap
                sx={{
                    fontSize: '0.8rem', color: neutral[500], lineHeight: 1.4,
                    ...(mono && { fontFamily: MONO, letterSpacing: '-0.01em' }),
                }}
            >
                {secondary}
            </Typography>
        )}
    </Box>
);

/** A hairline, a hover tint and nothing else. */
export const registerRowSx = {
    cursor: 'pointer',
    transition: 'background-color 0.12s',
    '&:hover': { bgcolor: alpha(brand[500], 0.04) },
    '&:last-child td': { borderBottom: 0 },
} as const;

/** 12px sides rather than 16: across eight columns that is 64px given back to the flexible ones. */
export const registerBodyCellSx = { ...dataBodyCellSx, px: 1.5, py: 1.1, verticalAlign: 'middle' } as const;

/**
 * border-box so a column's width includes its padding — otherwise every fixed column quietly takes
 * 24px more than declared, and the flexible columns pay for all of it.
 */
export const registerHeadCellSx = { ...dataHeadCellSx, px: 1.5, boxSizing: 'border-box' } as const;

// ── Row actions ───────────────────────────────────────────────────────────

export interface IRowMenuAction<A extends string> {
    action: A;
    title: string;
    icon: ReactNode;
    /** Listed below a divider, in red, so it is never the click next to a routine action. */
    destructive?: boolean;
    /**
     * Shown greyed with this reason on hover rather than hidden — for a blocker the user can clear
     * themselves ("load at least one movement first"). A missing permission is not that: drop the
     * action instead.
     */
    disabledReason?: string;
}

const DANGER = '#B91C1C';

const menuPaperSx = {
    mt: 0.5,
    minWidth: 216,
    borderRadius: '8px',
    border: `1px solid ${border.subtle}`,
    boxShadow: '0 10px 24px -6px rgba(15, 23, 42, 0.16), 0 2px 6px -2px rgba(15, 23, 42, 0.08)',
    '& .MuiList-root': { py: 0.5 },
} as const;

const menuItemSx = (danger = false) => ({
    mx: 0.5,
    px: 1.25,
    py: 0.75,
    minHeight: 34,
    borderRadius: '6px',
    gap: 1.25,
    color: danger ? DANGER : neutral[800],
    '& .MuiListItemIcon-root': { minWidth: 0, color: danger ? DANGER : neutral[500] },
    '&:hover': { bgcolor: danger ? alpha(DANGER, 0.06) : neutral[100] },
    '&:hover .MuiListItemIcon-root': { color: danger ? DANGER : neutral[700] },
    '&.Mui-focusVisible': { bgcolor: danger ? alpha(DANGER, 0.08) : neutral[100] },
    '&.Mui-disabled': { opacity: 0.45 },
});

const menuLabelProps = { fontSize: '0.875rem', fontWeight: 500 } as const;

/**
 * A row's actions behind one ⋮ button.
 *
 * <p>Reads as a list rather than a row of buttons — dark labels, grey icons, a grey hover — with red
 * kept for the destructive actions. A header names the record, because a menu floating over a dense
 * table should say which row it belongs to. It replaced a bordered "Actions" dropdown on every row,
 * which stacked identical boxes down the right edge and was the heaviest thing on the page.
 *
 * <p>`disableScrollLock` matters: without it the menu's modal hides the body scrollbar and pads the
 * body to compensate, so the whole page jumps sideways every time a row is opened.
 */
export const RowActionsMenu = <A extends string>({
    heading, subheading, viewLabel = 'View details', onView, actions, onPick, busy = false,
}: {
    /** What the row is — "Movement #68", "CNS-2026-0009". Also names the button for screen readers. */
    heading: string;
    /** Where it stands — its status. */
    subheading?: string;
    viewLabel?: string;
    onView: () => void;
    actions: IRowMenuAction<A>[];
    onPick: (action: A) => void;
    /** An action on this row is in flight; the button locks until it returns. */
    busy?: boolean;
}) => {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const routine = actions.filter((a) => !a.destructive);
    const destructive = actions.filter((a) => a.destructive);

    const run = (fn: () => void) => () => { setAnchor(null); fn(); };

    const item = (a: IRowMenuAction<A>) => {
        const row = (
            <MenuItem
                key={a.action}
                disabled={!!a.disabledReason}
                onClick={run(() => onPick(a.action))}
                sx={menuItemSx(a.destructive)}
            >
                <ListItemIcon>{a.icon}</ListItemIcon>
                <ListItemText primaryTypographyProps={menuLabelProps}>{a.title}</ListItemText>
            </MenuItem>
        );
        // A disabled MenuItem swallows pointer events, so the reason hangs off a wrapper.
        return a.disabledReason
            ? <Tooltip key={a.action} title={a.disabledReason} arrow placement="left"><Box>{row}</Box></Tooltip>
            : row;
    };

    const divider = <Divider sx={{ my: '4px !important', borderColor: neutral[100] }} />;

    return (
        <>
            <Tooltip title={busy ? 'Working…' : 'Actions'} arrow disableInteractive>
                {/* span: a disabled button fires no events, so the tooltip needs a live wrapper. */}
                <span>
                    <IconButton
                        size="small"
                        disabled={busy}
                        aria-label={`Actions for ${heading}`}
                        aria-haspopup="menu"
                        aria-expanded={!!anchor}
                        onClick={(e: MouseEvent<HTMLElement>) => setAnchor(e.currentTarget)}
                        sx={{
                            width: 30, height: 30, color: neutral[500],
                            '&:hover': { bgcolor: neutral[100], color: neutral[800] },
                            ...(anchor && { bgcolor: neutral[100], color: neutral[800] }),
                        }}
                    >
                        {busy
                            ? <CircularProgress size={14} sx={{ color: neutral[400] }} />
                            : <MoreVertIcon sx={{ fontSize: 18 }} />}
                    </IconButton>
                </span>
            </Tooltip>
            <Menu
                anchorEl={anchor}
                open={!!anchor}
                onClose={() => setAnchor(null)}
                disableScrollLock
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ elevation: 0, sx: menuPaperSx }}
                MenuListProps={{ dense: true, 'aria-label': `${heading} actions` }}
            >
                <Box sx={{ px: 1.75, pt: 0.75, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: neutral[500] }}>{heading}</Typography>
                    {subheading && (
                        <>
                            <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: neutral[300] }} />
                            <Typography sx={{ fontSize: '0.8rem', color: neutral[500] }}>{subheading}</Typography>
                        </>
                    )}
                </Box>
                {divider}
                <MenuItem onClick={run(onView)} sx={menuItemSx()}>
                    <ListItemIcon><VisibilityOutlinedIcon sx={{ fontSize: 16 }} /></ListItemIcon>
                    <ListItemText primaryTypographyProps={menuLabelProps}>{viewLabel}</ListItemText>
                </MenuItem>
                {routine.map(item)}
                {destructive.length > 0 && divider}
                {destructive.map(item)}
            </Menu>
        </>
    );
};
