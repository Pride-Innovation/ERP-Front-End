import { DataGridStyled, StyledBox } from '../../components/tables/Table';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { Box, Card } from '@mui/material';
import { camelCaseToWords } from '../../utils/helpers';
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
    handleOptionClicked
}: ITableComponent) => {
    const [filteredRows, setFilteredRows] = useState<GridRowsProp>(rows);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [currentID, setCurrentId] = useState<string | number>("")

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    useEffect(() => setFilteredRows(rows), [])

    const { handleTableFilter } = CustomTextFilterOperator({ rows: filteredRows, setFilteredRows, endPoint: "users" });
    const { handleTablePagination } = CustomTablePagination({ rows: filteredRows, endPoint: "users" });

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
                    loading={filteredRows.length === 0}
                    {...filteredRows}
                    rows={filteredRows}
                    columns={columns}
                    onFilterModelChange={handleTableFilter}
                    onPaginationModelChange={handleTablePagination}
                    /*
                        ** TO DO **
                        pass count value as a prop to this component. 
                        This is to display to number of records when paginating.
                        
                        rowCount={50}
                    */
                    slots={{
                        toolbar: () => (<CustomToolbarWrapper
                            header={header}
                            onCreationHandler={onCreationHandler}
                            onImportHandler={() => onImportHandler?.()}
                        />)
                    }}
                    autoHeight
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 5,
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