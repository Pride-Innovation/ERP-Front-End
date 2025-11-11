import {
    Box,
    styled,
    alpha,
} from '@mui/material';
import {
    DataGrid,
} from '@mui/x-data-grid';

const PRIMARY_COLOR = '#08796C';
const SECONDARY_COLOR = '#F8FAFB';
const BORDER_COLOR = '#E5E7EB';
const HOVER_COLOR = '#F3F4F6';
const TEXT_PRIMARY = '#1F2937';
const TEXT_SECONDARY = '#6B7280';

export const DataGridStyled = styled(DataGrid)(({ theme }) => ({
    border: 'none',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',

    // Column Headers
    '& .MuiDataGrid-columnHeaders': {
        backgroundColor: PRIMARY_COLOR,
        color: '#FFFFFF',
        fontWeight: 600,
        fontSize: '0.875rem',
        borderBottom: `2px solid ${alpha(PRIMARY_COLOR, 0.8)}`,
        minHeight: '56px !important',
        maxHeight: '56px !important',
    },

    '& .MuiDataGrid-columnHeader': {
        backgroundColor: PRIMARY_COLOR,
        color: '#FFFFFF',
        padding: '12px 16px',
        '&:focus, &:focus-within': {
            outline: 'none',
        },
    },

    '& .MuiDataGrid-columnHeaderTitle': {
        textTransform: 'capitalize',
        color: '#FFFFFF',
        fontWeight: 600,
        fontSize: '0.875rem',
        lineHeight: 1.5,
    },

    // Icon Styling in Headers
    '& .MuiDataGrid-columnHeaders .MuiSvgIcon-root': {
        color: '#FFFFFF !important',
        fontSize: '1.25rem',
    },

    '& .MuiDataGrid-menuIconButton .MuiSvgIcon-root': {
        color: '#FFFFFF !important',
    },

    '& .MuiDataGrid-sortIcon': {
        color: '#FFFFFF !important',
        opacity: 0.7,
        transition: 'opacity 0.2s',
        '&.Mui-active': {
            opacity: 1,
        },
    },

    '& .MuiDataGrid-filterIcon': {
        color: '#FFFFFF !important',
    },

    '& .MuiDataGrid-columnHeaderMenuIcon': {
        color: '#FFFFFF !important',
        opacity: 0.7,
        '&:hover': {
            opacity: 1,
        },
    },

    '& .MuiDataGrid-iconButtonContainer': {
        visibility: 'visible !important',
        marginLeft: 'auto',
    },

    // Row Styling
    '& .MuiDataGrid-row': {
        minHeight: '64px !important',
        maxHeight: 'none !important',
        borderBottom: `1px solid ${BORDER_COLOR}`,
        transition: 'background-color 0.15s ease',
        '&:hover': {
            backgroundColor: HOVER_COLOR,
        },
        '&.Mui-selected': {
            backgroundColor: alpha(PRIMARY_COLOR, 0.08),
            '&:hover': {
                backgroundColor: alpha(PRIMARY_COLOR, 0.12),
            },
        },
        '&:last-child': {
            borderBottom: 'none',
        },
    },

    // Cell Styling
    '& .MuiDataGrid-cell': {
        fontSize: '0.875rem',
        color: TEXT_PRIMARY,
        lineHeight: 1.5,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        borderBottom: 'none',
        minHeight: '64px !important',
        maxHeight: 'none !important',
        '&:focus, &:focus-within': {
            outline: 'none',
        },
    },

    // Virtual Scroller
    '& .MuiDataGrid-virtualScroller': {
        backgroundColor: '#FFFFFF',
    },

    // Footer
    '& .MuiDataGrid-footerContainer': {
        borderTop: `1px solid ${BORDER_COLOR}`,
        backgroundColor: SECONDARY_COLOR,
        minHeight: '56px',
        padding: '8px 16px',
    },

    '& .MuiTablePagination-root': {
        color: TEXT_SECONDARY,
        fontSize: '0.875rem',
    },

    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
        fontSize: '0.875rem',
        color: TEXT_SECONDARY,
        margin: 0,
    },

    '& .MuiTablePagination-select': {
        fontSize: '0.875rem',
        padding: '4px 8px',
        borderRadius: '6px',
        '&:focus': {
            backgroundColor: alpha(PRIMARY_COLOR, 0.08),
        },
    },

    // Scrollbar Styling
    '& .MuiDataGrid-virtualScroller::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
    },

    '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-track': {
        backgroundColor: SECONDARY_COLOR,
    },

    '& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb': {
        backgroundColor: alpha(PRIMARY_COLOR, 0.3),
        borderRadius: '4px',
        '&:hover': {
            backgroundColor: alpha(PRIMARY_COLOR, 0.5),
        },
    },

    // Loading Overlay
    '& .MuiDataGrid-overlay': {
        backgroundColor: alpha('#FFFFFF', 0.9),
    },

    // No Rows Overlay
    '& .MuiDataGrid-overlayWrapper': {
        minHeight: '400px',
    },
}));

export const StyledBox = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '4px 0',
    minHeight: '48px',
});

export const TableContainer = styled(Box)(({ theme }) => ({
    borderRadius: 12,
    boxShadow: `0 1px 3px 0 ${alpha('#000', 0.1)}, 0 1px 2px -1px ${alpha('#000', 0.1)}`,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    border: `1px solid ${BORDER_COLOR}`,
    margin: theme.spacing(0, 0, 2),
    position: 'relative',
    transition: 'box-shadow 0.3s ease',
    '&:hover': {
        boxShadow: `0 4px 6px -1px ${alpha('#000', 0.1)}, 0 2px 4px -2px ${alpha('#000', 0.1)}`,
    },
}));

// New: Styled component for multi-line cell content
export const MultiLineCell = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    width: '100%',
});

export const CellPrimaryText = styled('div')({
    fontSize: '0.875rem',
    fontWeight: 500,
    color: TEXT_PRIMARY,
    lineHeight: 1.4,
});

export const CellSecondaryText = styled('div')({
    fontSize: '0.75rem',
    color: TEXT_SECONDARY,
    lineHeight: 1.3,
});