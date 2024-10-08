import { DataGridStyled, StyledBox } from '../../components/tables/Table';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { Box, Card } from '@mui/material';
import { camelCaseToWords, isCamelCase } from '../../utils/helpers';
import { ITableComponent } from './interface';
import { TypographyComponent } from '../headers/TypographyComponent';
import ChipComponent from '../forms/Chip';
import CheckIcon from '@mui/icons-material/Check';
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';
import PopoverComponent from '../forms/Popover';
import CustomToolbarWrapper from './TableToolBar';
import CustomTextFilterOperator from './TableFilters';
import { useEffect, useState } from 'react';
import CustomTablePagination from './TablePagination';
import ButtonComponent from '../forms/Button';

const TableComponent = ({
    columnHeaders,
    rows,
    onCreationHandler,
    onImportHandler,
    header,
    handleOptionClicked,
    importData = false,
    createAction = false,
    exportData = false,
    count = 10,
    loading = false,
    endPoint = "users",
    paginationMode = 'server'
}: ITableComponent) => {
    const [filteredRows, setFilteredRows] = useState<GridRowsProp>(rows);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [currentID, setCurrentId] = useState<string | number>("")

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    useEffect(() => setFilteredRows(rows), [rows]);

    const { handleTableFilter } = CustomTextFilterOperator({ rows: filteredRows, setFilteredRows, endPoint });
    const { handleTablePagination } = CustomTablePagination({ endPoint });

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
                        <TypographyComponent weight={400} size='13.5px'>{
                            (isCamelCase(value as string) && value) ?
                                camelCaseToWords(value) : value}</TypographyComponent>
                    </StyledBox>
                )
                : (column.isBoolen) ? (
                    <StyledBox >
                        {value ?
                            <ChipComponent variant='filled' label='Available' icon={<CheckIcon fontSize='small' />} size='medium' color='success' /> :
                            <ChipComponent variant='filled' label='Leave' icon={<DoNotDisturbAltIcon fontSize='small' />} size='medium' color='error' />
                        }
                    </StyledBox>
                ) : (column.isAction) ? (
                    <StyledBox >
                        <ButtonComponent
                            handleClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                                handleClick?.(event)
                                setCurrentId(param.row?.id)
                            }}
                            sendingRequest={false}
                            buttonText={column.actionData?.label as string}
                            variant='outlined'
                            buttonColor='info'
                            type='button' />
                        <PopoverComponent
                            moduleID={currentID}
                            handleOptionClicked={handleOptionClicked}
                            options={(column.actionData?.options) as Array<{ value: string, label: string }>}
                            anchorEl={anchorEl}
                            setAnchorEl={setAnchorEl}
                        />
                    </StyledBox>
                ) : null
        }
    }));

    return (
        <Card sx={{ width: "100%" }} >
            <Box>
                <DataGridStyled
                    loading={loading}
                    {...filteredRows}
                    rows={filteredRows}
                    columns={columns}
                    onFilterModelChange={handleTableFilter}
                    onPaginationModelChange={handleTablePagination}
                    rowCount={count}
                    paginationMode={paginationMode}
                    slots={{
                        toolbar: () => (
                            <CustomToolbarWrapper
                                createAction={createAction}
                                exportData={exportData}
                                importData={importData}
                                header={header}
                                onCreationHandler={() => onCreationHandler?.()}
                                onImportHandler={() => onImportHandler?.()}
                            />)
                    }}
                    autoHeight
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 10,
                            },
                        },
                    }}
                    pageSizeOptions={[5, 10, 25, 50]}
                />
            </Box>
        </Card>
    )
}

export default TableComponent