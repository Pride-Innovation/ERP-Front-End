import {
    Box,
    styled,
    alpha,
} from '@mui/material';
import {
    DataGrid,
} from '@mui/x-data-grid';

const PRIMARY_COLOR = '#08796C';
const HEADER_TO = '#065E53';
const BORDER_COLOR = '#EEF2F7';
const HOVER_BG = '#F0FDF9';
const ROW_EVEN = '#FAFBFC';
const TEXT_PRIMARY = '#0F172A';
const TEXT_SECONDARY = '#64748B';

export const DataGridStyled = styled(DataGrid)(() => ({
    border: 'none',
    borderRadius: 0,
    backgroundColor: '#FFFFFF',
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',

    // v7: override the CSS variable that DataGrid uses to compute header background.
    // Even if the gradient override below ever fails, this solid colour guarantees
    // white text is readable.
    '--DataGrid-containerBackground': PRIMARY_COLOR,

    // ── Column Headers ────────────────────────────────────────────────────────
    // v7 DOM: .MuiDataGrid-columnHeaders > .MuiDataGrid-container--top > [role=row]
    // The background is NOT on .MuiDataGrid-columnHeaders — it lives two levels
    // deeper on [role=row] via: background: var(--DataGrid-containerBackground)
    // We target that exact element with a matching specificity + !important.
    '& .MuiDataGrid-columnHeaders': {
        borderBottom: `2px solid ${alpha('#fff', 0.15)}`,
        minHeight: '50px !important',
        maxHeight: '50px !important',
    },

    '& .MuiDataGrid-container--top [role=row]': {
        background: `linear-gradient(120deg, ${PRIMARY_COLOR} 0%, ${HEADER_TO} 100%) !important`,
        backgroundImage: `linear-gradient(120deg, ${PRIMARY_COLOR} 0%, ${HEADER_TO} 100%) !important`,
    },

    '& .MuiDataGrid-columnHeader': {
        backgroundColor: 'transparent !important',
        padding: '0 20px',
        '&:focus, &:focus-within': { outline: 'none' },
        '&:hover': { backgroundColor: 'rgba(255,255,255,0.08) !important' },
    },

    // v7 trailing filler / scrollbar-gap header element
    '& .MuiDataGrid-scrollbarFiller': {
        backgroundColor: `${HEADER_TO} !important`,
    },

    '& .MuiDataGrid-columnHeaderTitle': {
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.9)',
        fontWeight: 700,
        fontSize: '0.68rem',
        letterSpacing: '0.07em',
        lineHeight: 1.4,
    },

    '& .MuiDataGrid-columnHeaders .MuiSvgIcon-root': {
        color: 'rgba(255,255,255,0.75) !important',
        fontSize: '1.1rem',
    },
    '& .MuiDataGrid-menuIconButton .MuiSvgIcon-root': {
        color: 'rgba(255,255,255,0.75) !important',
    },
    '& .MuiDataGrid-sortIcon': {
        color: 'rgba(255,255,255,0.75) !important',
        opacity: '1 !important',
        fontSize: '1rem',
    },
    '& .MuiDataGrid-filterIcon': {
        color: 'rgba(255,255,255,0.75) !important',
    },
    '& .MuiDataGrid-columnHeaderMenuIcon': {
        color: 'rgba(255,255,255,0.7) !important',
    },
    '& .MuiDataGrid-iconButtonContainer': {
        visibility: 'visible !important',
    },
    '& .MuiDataGrid-columnSeparator': {
        color: 'rgba(255,255,255,0.15)',
        '&:hover': { color: 'rgba(255,255,255,0.4)' },
    },

    // ── Rows ──────────────────────────────────────────────────────────────────
    '& .MuiDataGrid-row': {
        minHeight: '60px !important',
        maxHeight: 'none !important',
        borderBottom: `1px solid ${BORDER_COLOR}`,
        transition: 'background-color 0.12s ease, box-shadow 0.12s ease',
        position: 'relative',

        '&:nth-of-type(even)': { backgroundColor: ROW_EVEN },

        '&:hover': {
            backgroundColor: HOVER_BG,
            boxShadow: `inset 3px 0 0 ${PRIMARY_COLOR}`,
            '& .MuiDataGrid-cell': { color: TEXT_PRIMARY },
        },

        '&.Mui-selected': {
            backgroundColor: alpha(PRIMARY_COLOR, 0.06),
            boxShadow: `inset 3px 0 0 ${PRIMARY_COLOR}`,
            '&:hover': { backgroundColor: alpha(PRIMARY_COLOR, 0.1) },
        },

        '&:last-child': { borderBottom: 'none' },
    },

    // ── Cells ─────────────────────────────────────────────────────────────────
    '& .MuiDataGrid-cell': {
        fontSize: '0.875rem',
        color: TEXT_PRIMARY,
        lineHeight: 1.55,
        padding: '8px 20px',
        display: 'flex',
        alignItems: 'center',
        borderBottom: 'none',
        minHeight: '60px !important',
        maxHeight: 'none !important',
        '&:focus, &:focus-within': { outline: 'none' },
    },

    // ── Virtual Scroller ──────────────────────────────────────────────────────
    '& .MuiDataGrid-virtualScroller': { backgroundColor: '#FFFFFF' },

    // ── Footer ────────────────────────────────────────────────────────────────
    '& .MuiDataGrid-footerContainer': {
        borderTop: `1px solid ${BORDER_COLOR}`,
        backgroundColor: ROW_EVEN,
        minHeight: '50px',
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
        '&:focus': { backgroundColor: alpha(PRIMARY_COLOR, 0.08) },
    },
    '& .MuiTablePagination-actions button': {
        borderRadius: '6px',
        transition: 'all 0.15s',
        '&:hover': {
            backgroundColor: alpha(PRIMARY_COLOR, 0.08),
            color: PRIMARY_COLOR,
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
        backgroundColor: alpha(PRIMARY_COLOR, 0.22),
        borderRadius: '3px',
        '&:hover': { backgroundColor: alpha(PRIMARY_COLOR, 0.42) },
    },

    // ── Overlays ──────────────────────────────────────────────────────────────
    '& .MuiDataGrid-overlay': { backgroundColor: alpha('#FFFFFF', 0.85) },
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
    minHeight: '44px',
    overflow: 'hidden',
});

export const TableContainer = styled(Box)(({ theme }) => ({
    borderRadius: 14,
    boxShadow: `0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)`,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    border: `1px solid ${BORDER_COLOR}`,
    margin: theme.spacing(0, 0, 2),
    position: 'relative',
    transition: 'box-shadow 0.25s ease',
    '&:hover': {
        boxShadow: `0 4px 12px -2px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.06)`,
    },
}));

export const MultiLineCell = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    width: '100%',
    overflow: 'hidden',
});

export const CellPrimaryText = styled('div')({
    fontSize: '0.875rem',
    fontWeight: 600,
    color: TEXT_PRIMARY,
    lineHeight: 1.4,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
});

export const CellSecondaryText = styled('div')({
    fontSize: '0.73rem',
    fontWeight: 400,
    color: TEXT_SECONDARY,
    lineHeight: 1.3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
});
