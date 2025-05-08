/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    styled,
} from '@mui/material';
import {
    DataGrid,
} from '@mui/x-data-grid';

export const DataGridStyled = styled(DataGrid)(({ theme }) => ({
    '& .MuiDataGrid-columnHeaderTitle': {
        // fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    // Remove focus outline on cells
    '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
        outline: 'none',
    },
    // Remove focus outline on column headers
    '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
        outline: 'none',
    },
    // Optional: Remove row hover/selected styling
    '& .MuiDataGrid-row.Mui-selected': {
        backgroundColor: 'inherit',
    },

    border: 'none',
    borderRadius: 2,
    '& .MuiDataGrid-columnHeaders': {
        backgroundColor: '#BC892C',
        color: 'teal',
        fontWeight: 'bold',
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
}));


export const StyledBox = styled(Box)({
    display: "flex",
    alignItems: "center",
    height: "100%"
});
