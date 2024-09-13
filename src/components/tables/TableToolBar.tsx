import { GridPagination, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid'
import { blue } from '@mui/material/colors';

const TableToolBar = () => {
    return (

        <GridToolbarContainer
            sx={{ width: '100%', display: 'flex', p: '20px' }}>
            <GridToolbarExport sx={{
                backgroundColor: blue[800],
                color: 'background.paper',
                height: '40px',
                mr: '10px',
                px: '10px'
            }} />
            <GridPagination sx={{
                marginLeft: 'auto',
            }} />
        </GridToolbarContainer>
    )
}

export default TableToolBar