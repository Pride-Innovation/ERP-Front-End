
import {
    styled,
} from '@mui/material';
import {
    DataGrid,
} from '@mui/x-data-grid';

export const DataGridStyled = styled(DataGrid)(({ theme }) => ({
    border: 'none',
    "& .MuiDataGrid-columnHeaders": {
        fontSize: 14,
        borderTop: "0.6px solid rgba(0,0,0,0.05) !important",
    },
    "& .MuiDataGrid-row": {
        maxHeight: 'none !important',
        "&:hover": {
            cursor: "pointer"
        }
    },
    "& .MuiDataGrid-columnHeaderTitle": {
        fontWeight: '600 !important',
        color: theme.palette.grey[900]
    },
    '&>.MuiDataGrid-main': {
        '&>.MuiDataGrid-columnHeaders': {
            borderBottom: `1px solid${theme.palette.grey[300]}`,
            borderTop: `1px solid${theme.palette.grey[300]} !important`,
            borderRadius: '0px',
        }, '& div div div div >.MuiDataGrid-cell': {
            borderBottom: `1px solid${theme.palette.grey[100]}`,
        },
    },
    '&.MuiDataGrid-root': {
        border: 'none',
    },
    "&.MuiDataGrid-root .MuiDataGrid-cell:focus-within": {
        outline: "none !important",
    },
    '& .MuiDataGrid-columnHeader:focus-within, & .MuiDataGrid-columnHeader:focus': {
        outline: 'none !important',
    },

    '& .MuiDataGrid-cell': {
        lineHeight: 'unset !important',
        maxHeight: 'none !important',
        whiteSpace: 'normal',
    },
}));

