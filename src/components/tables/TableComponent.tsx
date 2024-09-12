import { DataGridStyled, StyledBox } from '../../components/tables/Table';
import { GridColDef } from '@mui/x-data-grid';
import { Box, Card } from '@mui/material';
import { camelCaseToWords } from '../../utils/helpers';
import { ITableComponent } from './interface';
import { TypographyComponent } from '../headers/TypographyComponent';
import ChipComponent from '../forms/Chip';
import CheckIcon from '@mui/icons-material/Check';
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';
import PopoverComponent from '../forms/Popover';

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

            return (column.isText || column.isNumber) ?
                (
                    <StyledBox>
                        <TypographyComponent weight={400} size='13.5px'>{value}</TypographyComponent>
                    </StyledBox>
                )
                : (column.isBoolen) ? (
                    <StyledBox >
                        {value ?
                            <ChipComponent label='Available' icon={<CheckIcon fontSize='small' />} size='medium' color='success' /> :
                            <ChipComponent label='Leave' icon={<DoNotDisturbAltIcon fontSize='small' />} size='medium' color='error' />
                        }
                    </StyledBox>
                ) : (column.isAction) ? (
                    <StyledBox >
                        <PopoverComponent
                            options={(column.actionData?.options) as Array<{ value: string, label: string }>}
                            buttonText={column.actionData?.label as string} />
                    </StyledBox>
                ) : null
        }
    }));


    return (
        <Card sx={{ width: "100%" }} >
            <Box>
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