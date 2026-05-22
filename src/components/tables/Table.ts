import {
    Box,
    styled,
    alpha,
} from '@mui/material';
import {
    DataGrid,
} from '@mui/x-data-grid';
import { brand, neutral, border as borderToken, surface } from '../../utils/tokens';

const HEADER_BG = surface.muted;
const HEADER_TEXT = neutral[700];
const HEADER_BORDER = borderToken.subtle;
const ROW_BORDER = neutral[150];
const HOVER_BG = alpha(brand[500], 0.05);
const TEXT_PRIMARY = neutral[900];
const TEXT_SECONDARY = neutral[500];

export const DataGridStyled = styled(DataGrid)(() => ({
    border: 'none',
    borderRadius: 0,
    backgroundColor: surface.card,
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',

    // v7 background CSS variable for the header row.
    '--DataGrid-containerBackground': HEADER_BG,

    // ── Column Headers (sticky) ───────────────────────────────────────────────
    '& .MuiDataGrid-columnHeaders': {
        borderBottom: `1px solid ${HEADER_BORDER}`,
        minHeight: '44px !important',
        maxHeight: '44px !important',
        position: 'sticky',
        top: 0,
        zIndex: 2,
    },

    '& .MuiDataGrid-container--top [role=row]': {
        background: `${HEADER_BG} !important`,
        backgroundImage: 'none !important',
    },

    '& .MuiDataGrid-columnHeader': {
        backgroundColor: 'transparent !important',
        padding: '0 18px',
        '&:focus, &:focus-within': { outline: 'none' },
        '&:hover': {
            backgroundColor: alpha(brand[500], 0.06),
            // Reveal sort/menu icons on hover.
            '& .MuiDataGrid-iconButtonContainer, & .MuiDataGrid-menuIconButton': {
                opacity: 1,
            },
        },
    },

    // v7 trailing filler / scrollbar-gap header element
    '& .MuiDataGrid-scrollbarFiller': {
        backgroundColor: `${HEADER_BG} !important`,
        borderBottom: `1px solid ${HEADER_BORDER}`,
    },

    '& .MuiDataGrid-columnHeaderTitle': {
        textTransform: 'uppercase',
        color: HEADER_TEXT,
        fontWeight: 700,
        fontSize: '0.65rem',
        letterSpacing: '0.07em',
        lineHeight: 1.4,
    },

    // Header icons: hidden by default, revealed on header-cell hover.
    '& .MuiDataGrid-iconButtonContainer, & .MuiDataGrid-menuIconButton': {
        opacity: 0,
        transition: 'opacity 0.15s ease',
    },
    '& .MuiDataGrid-columnHeader--sorted .MuiDataGrid-iconButtonContainer, & .MuiDataGrid-columnHeader--filtered .MuiDataGrid-iconButtonContainer': {
        opacity: 1,
    },
    '& .MuiDataGrid-columnHeaders .MuiSvgIcon-root': {
        color: `${neutral[500]} !important`,
        fontSize: '0.95rem',
    },
    '& .MuiDataGrid-sortIcon': {
        color: `${neutral[500]} !important`,
        opacity: '1 !important',
        fontSize: '0.95rem',
    },
    '& .MuiDataGrid-iconButtonContainer': {
        visibility: 'visible !important',
    },
    '& .MuiDataGrid-columnSeparator': {
        color: 'transparent',
        '&:hover': { color: neutral[300] },
    },

    // ── Rows (compact, no zebra) ──────────────────────────────────────────────
    '& .MuiDataGrid-row': {
        minHeight: '44px !important',
        maxHeight: 'none !important',
        backgroundColor: surface.card,
        borderBottom: `1px solid ${ROW_BORDER}`,
        transition: 'background-color 0.12s ease, box-shadow 0.12s ease',
        position: 'relative',

        '&:hover': {
            backgroundColor: HOVER_BG,
            boxShadow: `inset 3px 0 0 ${brand[500]}`,
            '& .MuiDataGrid-cell': { color: TEXT_PRIMARY },
        },

        '&.Mui-selected': {
            backgroundColor: alpha(brand[500], 0.08),
            boxShadow: `inset 3px 0 0 ${brand[500]}`,
            '&:hover': { backgroundColor: alpha(brand[500], 0.12) },
        },

        '&:last-child': { borderBottom: 'none' },
    },

    // ── Cells ─────────────────────────────────────────────────────────────────
    '& .MuiDataGrid-cell': {
        fontSize: '0.825rem',
        color: TEXT_PRIMARY,
        lineHeight: 1.5,
        padding: '6px 18px',
        display: 'flex',
        alignItems: 'center',
        borderBottom: 'none',
        minHeight: '44px !important',
        maxHeight: 'none !important',
        '&:focus, &:focus-within': {
            outline: `2px solid ${alpha(brand[500], 0.5)}`,
            outlineOffset: -2,
            borderRadius: 2,
        },
    },

    // ── Virtual Scroller ──────────────────────────────────────────────────────
    '& .MuiDataGrid-virtualScroller': { backgroundColor: surface.card },

    // ── Footer ────────────────────────────────────────────────────────────────
    '& .MuiDataGrid-footerContainer': {
        borderTop: `1px solid ${HEADER_BORDER}`,
        backgroundColor: surface.muted,
        minHeight: '44px',
        padding: '4px 12px',
    },

    '& .MuiTablePagination-root': {
        color: TEXT_SECONDARY,
        fontSize: '0.8125rem',
    },
    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
        fontSize: '0.8125rem',
        color: TEXT_SECONDARY,
        margin: 0,
    },
    '& .MuiTablePagination-select': {
        fontSize: '0.8125rem',
        padding: '4px 8px',
        borderRadius: '6px',
        '&:focus': { backgroundColor: alpha(brand[500], 0.08) },
    },
    '& .MuiTablePagination-actions button': {
        borderRadius: '6px',
        transition: 'all 0.15s',
        '&:hover': {
            backgroundColor: alpha(brand[500], 0.08),
            color: brand[500],
        },
        '&.Mui-disabled': { opacity: 0.35 },
    },

    // ── Scrollbar ─────────────────────────────────────────────────────────────
    '& .MuiDataGrid-virtualScroller::-webkit-scrollbar': {
        width: '5px',
        height: '5px',
    },
    '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-track': {
        backgroundColor: 'transparent',
    },
    '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb': {
        backgroundColor: alpha(brand[500], 0.22),
        borderRadius: '3px',
        '&:hover': { backgroundColor: alpha(brand[500], 0.42) },
    },

    // ── Overlays ──────────────────────────────────────────────────────────────
    '& .MuiDataGrid-overlay': { backgroundColor: alpha(surface.card, 0.85) },
    '& .MuiDataGrid-overlayWrapper': { minHeight: '220px' },

    // ── Loading skeleton ──────────────────────────────────────────────────────
    '& .MuiDataGrid-skeletonCell': { opacity: 0.5 },
}));

// ─────────────────────────────────────────────────────────────────────────────

export const StyledBox = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '4px 0',
    minHeight: '40px',
    overflow: 'hidden',
});

export const TableContainer = styled(Box)(({ theme }) => ({
    borderRadius: 12,
    boxShadow: 'none',
    backgroundColor: surface.card,
    overflow: 'hidden',
    border: `1px solid ${borderToken.subtle}`,
    margin: theme.spacing(0, 0, 2),
    position: 'relative',
    transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
    '&:hover': {
        borderColor: borderToken.default,
        boxShadow: '0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.03)',
    },
}));

export const MultiLineCell = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    width: '100%',
    overflow: 'hidden',
});

export const CellPrimaryText = styled('div')({
    fontSize: '0.825rem',
    fontWeight: 600,
    color: TEXT_PRIMARY,
    lineHeight: 1.35,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
});

export const CellSecondaryText = styled('div')({
    fontSize: '0.72rem',
    fontWeight: 400,
    color: TEXT_SECONDARY,
    lineHeight: 1.3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
});
