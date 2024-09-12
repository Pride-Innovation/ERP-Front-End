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

    const columns: GridColDef[] = columnHeaders.map((column) => ({
        field: `${column.label}`,
        headerName: camelCaseToWords(column.label),
        flex: 1,
        minWidth: 100,
        renderCell: (param) => {
            const value = param.row[column.label];
            return (
                (
                    ['string', 'number'].includes(typeof value)
                    || value instanceof (String || Number)))
                && column.label !== 'Action' && column.label !== 'Status' ?
                (
                    <TypographyComponent sx={{
                        display: "flex",
                        alignItems: "center",
                        height: "100%"
                    }} weight={400} size='13.5px'>{value}</TypographyComponent>
                )
                :
                (typeof value === 'string') && column.label === 'Action' ? (
                    <Button
                        sx={{ textTransform: "capitalize" }} >
                        {value}
                    </Button>
                ) :
                    (typeof value === 'string') && column.label === 'Status' ? (
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
                    loading={rows.length === 0}
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