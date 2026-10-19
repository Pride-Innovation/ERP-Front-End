/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { border, neutral } from '../../../utils/tokens';

/**
 * The small vocabulary the movement detail cards share — Items, Documents and Details — so the
 * three read as one page: a muted group label, a bordered list with hairlines between rows, and a
 * label-above-value field. Sentence case and one neutral palette throughout; colour is left to the
 * things that carry meaning (status chips, file types).
 */

/** A bordered list whose rows are separated by hairlines. */
export const listSx = {
    border: `1px solid ${border.subtle}`, borderRadius: '8px', overflow: 'hidden',
    '& > * + *': { borderTop: `1px solid ${neutral[100]}` },
} as const;

/** The heading of a group inside a card, with an optional count. */
export const GroupLabel = ({ children, count }: { children: ReactNode; count?: number }) => (
    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: neutral[500] }}>{children}</Typography>
        {count != null && (
            <Box sx={{ px: 0.75, borderRadius: '6px', bgcolor: neutral[100], color: neutral[600], fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.6 }}>
                {count}
            </Box>
        )}
    </Stack>
);

/** A label above its value. An absent value reads as a muted placeholder rather than as blank. */
export const Field = ({ label, children, empty = '—' }: { label: string; children?: ReactNode; empty?: string }) => (
    <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: '0.8rem', color: neutral[500], mb: 0.25 }}>{label}</Typography>
        {children == null || children === '' ? (
            <Typography sx={{ fontSize: '0.875rem', color: neutral[400] }}>{empty}</Typography>
        ) : typeof children === 'string' || typeof children === 'number' ? (
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: neutral[800], wordBreak: 'break-word' }}>{children}</Typography>
        ) : children}
    </Box>
);

const initialsOf = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
};

/** A person as a value: grey initials and their name. One neutral tone for every role. */
export const PersonValue = ({ name }: { name: string }) => (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
        <Box sx={{
            width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: neutral[100], color: neutral[600], fontSize: '0.8rem', fontWeight: 600,
        }}
        >
            {initialsOf(name)}
        </Box>
        <Typography noWrap title={name} sx={{ fontSize: '0.875rem', fontWeight: 600, color: neutral[800] }}>{name}</Typography>
    </Stack>
);
