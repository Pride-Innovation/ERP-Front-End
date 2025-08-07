/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    styled,
    alpha,
} from '@mui/material';
import {
    DataGrid,
} from '@mui/x-data-grid';

const PRIMARY_COLOR = '#08796C';

export const DataGridStyled = styled(DataGrid)(({ theme }) => ({
    border: 'none',
    borderRadius: 2,

    '& .MuiDataGrid-columnHeaders': {
        backgroundColor: PRIMARY_COLOR,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },

    '& .MuiDataGrid-columnHeaderTitle': {
        textTransform: 'capitalize',
        color: '#FFFFFF',
    },

    '& .MuiDataGrid-columnHeader .MuiDataGrid-iconButtonContainer': {
        visibility: 'visible !important',
    },

    // Target all SVG icons in column header area
    '& .MuiDataGrid-columnHeaders .MuiSvgIcon-root': {
        color: '#FFFFFF !important',
    },

    // Target the specific menu button SVG
    '& .MuiDataGrid-menuIconButton .MuiSvgIcon-root': {
        color: '#FFFFFF !important',
    },

    // Make sure filter button icons are white
    '& .MuiDataGrid-filterIcon': {
        color: '#FFFFFF !important',
    },

    '& .MuiDataGrid-columnHeader:not(.MuiDataGrid-columnHeader--sorted) .MuiDataGrid-sortIcon': {
        opacity: 1,
        color: '#FFFFFF',
    },

    '& .MuiDataGrid-columnHeaderTitleContainer .MuiDataGrid-iconButtonContainer .MuiSvgIcon-root': {
        color: '#FFFFFF !important',
    },

    '& .MuiDataGrid-sortIcon': {
        color: '#FFFFFF !important',
    },

    '& .MuiDataGrid-columnHeaderMenuIcon': {
        color: '#FFFFFF !important',
        opacity: 1,
        visibility: 'visible',
    },

    '& .MuiDataGrid-columnHeader': {
        backgroundColor: PRIMARY_COLOR,
        color: '#FFFFFF',
    },

    // Target any button inside column headers
    '& .MuiDataGrid-columnHeaders button': {
        color: '#FFFFFF !important',
    },

    // Target any icon button in headers
    '& .MuiDataGrid-columnHeaders .MuiIconButton-root': {
        color: '#FFFFFF !important',
    },

    '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
        outline: 'none',
    },

    '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
        outline: 'none',
    },

    '& .MuiDataGrid-row.Mui-selected': {
        backgroundColor: alpha(PRIMARY_COLOR, 0.08),
        '&:hover': {
            backgroundColor: alpha(PRIMARY_COLOR, 0.12),
        }
    },

    '& .MuiDataGrid-row:hover': {
        backgroundColor: '#F1F1F1',
    },

    '& .MuiDataGrid-cell': {
        fontSize: 14,
    },

    '& .MuiDataGrid-footerContainer': {
        borderTop: '1px solid #E0E0E0',
    },

    '& .MuiDataGrid-menuIcon': {
        visibility: 'visible !important',
        width: 'auto !important',
        color: '#FFFFFF !important',
        display: 'flex !important',
        alignItems: 'center !important',
        fontSize: '20px !important',
    },
}));

export const StyledBox = styled(Box)({
    display: "flex",
    alignItems: "center",
    height: "100%",
    padding: '4px 0'
});

export const TableContainer = styled(Box)(({ theme }) => ({
    borderRadius: 8,
    boxShadow: `0 2px 8px ${alpha('#000', 0.05)}`,
    backgroundColor: '#fff',
    overflow: 'hidden',
    border: `1px solid ${alpha('#000', 0.08)}`,
    margin: theme.spacing(0, 0, 2),
    position: 'relative',
}));