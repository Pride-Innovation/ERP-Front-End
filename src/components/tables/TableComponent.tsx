import { DataGridStyled } from '../../components/tables/Table';
import { GridColDef } from '@mui/x-data-grid';
import { Box, Button, Card } from '@mui/material';
import { camelCaseToWords } from '../../utils/helpers';
import { ITableComponent } from './interface';
import { TypographyComponent } from '../headers/TypographyComponent';

const TableComponent = ({
    columnHeaders,
    rows
}: ITableComponent) => {

    const columns: GridColDef[] = (
        [...columnHeaders]).map((label) => ({
            field: label,
            headerName: camelCaseToWords(label),
            flex: 1,
            minWidth: 100,
            renderCell: (param) => {
                const value = param.row[label];
                return (
                    (
                        ['string', 'number'].includes(typeof value)
                        || value instanceof (String || Number)))
                    && label !== 'Action' && label !== 'Status' ? 
                    (
                        <TypographyComponent sx={{
                            display: "flex",
                            alignItems: "center",
                            height: "100%"
                        }} weight={400} size='13.5px'>{value}</TypographyComponent>
                    )
                     :
                    (typeof value === 'string') && label === 'Action' ? (
                        <Button
                            sx={{ textTransform: "capitalize" }} >
                            {value}
                        </Button>
                    ) :
                        (typeof value === 'string') && label === 'Status' ? (
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                bool
                            </Box>
                        ) : value
            }
        }));


    return (
        <Card sx={{ pb: 2, width: "100%" }} >
            <Box
            >
                <DataGridStyled
                    {...rows}
                    rows={rows}
                    columns={columns}
                    autoHeight
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 10,
                            },
                        },
                    }}
                    pageSizeOptions={[5, 10]}
                />
            </Box>
        </Card>
    )
}

export default TableComponent