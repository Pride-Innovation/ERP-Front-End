/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { alpha } from '@mui/material';
import { brand, neutral, border } from '../../utils/tokens';

/**
 * The house style for the app's rich data tables — the audit-trail grammar
 * (`pages/reports/ReportDataTable`) expressed as shared tokens.
 *
 * Import these rather than restating the values, so a table added later cannot drift a border
 * colour or a letter-spacing away from the ones already shipped.
 */

/** Tinted, uppercase, sortable column head. */
export const dataHeadCellSx = {
    bgcolor: neutral[50],
    color: neutral[500],
    fontWeight: 700,
    fontSize: '0.68rem',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    whiteSpace: 'nowrap',
    py: 1.25,
    px: 2,
    borderBottom: `1px solid ${border.subtle}`,
    '& .MuiTableSortLabel-root': {
        color: neutral[500],
        '&:hover': { color: brand[500] },
        '&.Mui-active': { color: brand[600] },
    },
    '& .MuiTableSortLabel-icon': { color: `${brand[500]} !important` },
} as const;

/** Body cell — pairs with `dataRowSx`. */
export const dataBodyCellSx = {
    py: 1.2,
    px: 2,
    fontSize: '0.78rem',
    color: neutral[800],
    borderColor: neutral[100],
} as const;

/**
 * Zebra row with a brand rail on hover.
 *
 * @param index    row position, for the stripe
 * @param clickable adds the pointer cursor when the row itself navigates
 */
export const dataRowSx = (index: number, clickable = false) => ({
    cursor: clickable ? 'pointer' : 'default',
    bgcolor: index % 2 === 0 ? '#fff' : neutral[50],
    transition: 'background-color 0.12s',
    '&:hover': {
        bgcolor: alpha(brand[500], 0.05),
        boxShadow: `inset 3px 0 0 ${brand[500]}`,
    },
    '&:last-child td': { borderBottom: 0 },
});

/** Footer pagination strip. */
export const dataPaginationSx = {
    borderTop: `1px solid ${border.subtle}`,
    bgcolor: neutral[50],
    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
        fontSize: '0.78rem',
        color: neutral[500],
    },
    '& .MuiTablePagination-select': { fontSize: '0.78rem' },
} as const;

/** The card the table sits in. */
export const dataSurfaceSx = {
    border: `1px solid ${border.subtle}`,
    borderRadius: 2,
    overflow: 'hidden',
} as const;

/**
 * Compact pill dropdown for a row's action menu, matching the filter panels' selects.
 * Pair with `MenuProps={{ disableScrollLock: true }}` — without it the menu's modal pads the
 * body to replace the hidden scrollbar and the whole page jumps sideways.
 */
export const dataActionSelectSx = {
    '& .MuiOutlinedInput-root': { borderRadius: '8px' },
    borderRadius: '8px',
    bgcolor: '#fff',
    fontSize: '0.75rem',
    fontWeight: 600,
    height: 30,
    color: neutral[600],
    '& .MuiSelect-select': { py: 0, pl: 1.25, display: 'flex', alignItems: 'center' },
    '& .MuiSelect-icon': { color: neutral[400], right: 4 },
    '& fieldset': { borderColor: border.subtle },
    '&:hover fieldset': { borderColor: brand[500] },
    '&.Mui-focused fieldset': { borderColor: brand[500], borderWidth: 1 },
} as const;

/** Paper styling for a row action menu's dropdown. */
export const dataActionMenuPaperSx = {
    mt: 0.5,
    minWidth: 190,
    borderRadius: 2,
    border: `1px solid ${border.subtle}`,
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.1)',
} as const;
