import { IconButton, TextField } from '@mui/material'
import { GridPagination, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid'
import SearchIcon from '@mui/icons-material/Search';
import { blue } from '@mui/material/colors';

const TableToolBar = () => {
    return (

        <GridToolbarContainer
            sx={{ width: '100%', display: 'flex', p: '20px' }}>
            <GridToolbarExport sx={(theme: any) => ({
                backgroundColor: blue[800],
                color: theme.palette.background.paper,
                height: '40px',
                mr: '10px',
                px: '10px'
            })} />
            <GridPagination sx={{
                marginLeft: 'auto',
            }} />
        </GridToolbarContainer>
    )
}

export default TableToolBar