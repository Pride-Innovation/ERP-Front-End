/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ReactNode } from 'react';
import { alpha, Divider, Paper, Popper, Stack, Typography } from '@mui/material';
import { brand } from '../../utils/tokens';

/**
 * Chrome shared by the app's action modals — the dropdown surface and the section divider.
 *
 * <p>Extracted from the repair/disposal modal, which is where this look was first built. Keeping it
 * there meant any other modal either imported from an unrelated feature folder or restated the
 * values, and a restated dropdown drifts a radius or a highlight colour away within a release.
 */

const PRIMARY = brand[500];

/**
 * Popper for an Autocomplete inside a modal.
 *
 * <p>The z-index matters: MUI's modal sits at 1300, so a dropdown left at its default renders
 * *behind* the dialog it belongs to. `preventOverflow` and `flip` keep a list opening near the
 * bottom of the viewport inside the window rather than off the end of it.
 */
export const DropdownPopper = (props: any) => (
    <Popper
        {...props}
        placement="bottom-start"
        style={{ ...props.style, zIndex: 1500 }}
        modifiers={[
            { name: 'preventOverflow', options: { altBoundary: true, rootBoundary: 'document', padding: 8 } },
            { name: 'flip', options: { altBoundary: true, rootBoundary: 'document', padding: 8 } },
        ]}
    />
);

/** Elevated rounded dropdown surface with comfortable option rows and a brand highlight. */
export const DropdownPaper = ({ children, ...props }: any) => (
    <Paper
        {...props}
        elevation={4}
        sx={{
            mt: 0.5,
            borderRadius: '8px',
            boxShadow: `0 4px 24px ${alpha('#000', 0.12)}`,
            '& .MuiAutocomplete-listbox': {
                padding: '4px 0',
                '& .MuiAutocomplete-option': {
                    fontSize: '0.875rem',
                    minHeight: 40,
                    px: 2,
                    '&:hover': { backgroundColor: alpha(PRIMARY, 0.06) },
                    '&[aria-selected="true"]': {
                        backgroundColor: alpha(PRIMARY, 0.1),
                        color: PRIMARY,
                        fontWeight: 500,
                    },
                },
            },
        }}
    >
        {children}
    </Paper>
);

/** Uppercase micro-label with a trailing rule — the app's in-modal section divider. */
export const SectionLabel = ({ children }: { children: ReactNode }) => (
    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ pt: 0.5 }}>
        <Typography
            variant="caption"
            sx={{
                fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
                color: '#94A3B8', fontSize: '0.66rem', whiteSpace: 'nowrap',
            }}
        >
            {children}
        </Typography>
        <Divider sx={{ flex: 1, borderColor: '#EEF2F7' }} />
    </Stack>
);

/** The calm outlined Cancel that sits beside a modal's primary action. */
export const modalCancelSx = {
    borderRadius: '8px',
    fontWeight: 600,
    textTransform: 'none',
    color: '#64748B',
    borderColor: '#E2E8F0',
    '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
} as const;
