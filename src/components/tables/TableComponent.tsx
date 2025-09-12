/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { DataGridStyled, StyledBox } from '../../components/tables/Table';
import { GridColDef } from '@mui/x-data-grid';
import {
    alpha,
    Avatar,
    Box,
    Card,
    useTheme
} from '@mui/material';
import {
    camelCaseToWords,
    determineImage,
    formatToUGXMoney,
    isCamelCase
} from '../../utils/helpers';
import { ITableComponent } from './interface';
import { TypographyComponent } from '../headers/TypographyComponent';
import ChipComponent from '../forms/Chip';
import SpeedIcon from '@mui/icons-material/Speed';
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';
import AccessAlarmsIcon from '@mui/icons-material/AccessAlarms';
import PopoverComponent from '../forms/Popover';
import CustomToolbarWrapper from './TableToolBar';
import CustomTextFilterOperator from './TableFilters';
import { useState } from 'react';
import CustomTablePagination from './TablePagination';
import ButtonComponent from '../forms/Button';
import TimeLineDot from '../timeLineDots';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import NoAccountsIcon from '@mui/icons-material/NoAccounts';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import TableUtills from './utills';


const TableComponent = ({
    columnHeaders,
    rows,
    onCreationHandler,
    module,
    header,
    handleOptionClicked,
    importData = false,
    createAction = false,
    exportData = false,
    count = 10,
    loading = false,
    searchAction = false,
    endPoint = "users",
    paginationMode = 'server',
    filterMode = 'client',
    params,
    refresh = false,
    filterOptions = false,
    optionsfilterParams,
    status = false,
    onStatusChange,
    selectedStatus = 'all',
}: ITableComponent) => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [currentOptions, setCurrentOptions] = useState<any[]>([]);
    const [currentID, setCurrentId] = useState<string | number>("")
    const theme = useTheme()
    const { handleOptionsFilter } = TableUtills({ moduleName: module });

    const handleClick = (
        event: React.MouseEvent<HTMLButtonElement>,
        row: any,
        column: any
    ) => {
        setAnchorEl(event.currentTarget);
        const filteredOptions = handleOptionsFilter(
            column,
            filterOptions,
            row,
            module as string,
            optionsfilterParams || {}
        );

        setCurrentOptions(filteredOptions);
    };

    const { handleTableFilter } = CustomTextFilterOperator({ endPoint, params });
    const { handleTablePagination } = CustomTablePagination({ endPoint, params, selectedStatus });

    const columns: GridColDef[] = columnHeaders.map((column) => ({
        field: `${column.label}`,
        headerName: camelCaseToWords(column.label),
        flex: column.label === "image" ? 0.5 : column.label === "email" ? 1.5 : 1,
        minWidth: 100,
        renderCell: (param) => {
            const value = param.row[column.label];

            return (column.isImage) ? (
                <StyledBox sx={{ p: 0.5 }}>
                    <Avatar src={determineImage(param.row)} alt='image' sx={{ height: 45, width: 45 }} />
                </StyledBox>
            )
                : (column.isText || column.isNumber) ?
                    (
                        <StyledBox>
                            {column.label === "email" && <MailOutlineIcon fontSize='small' color='secondary' sx={{ mr: "5px" }} />}
                            <TypographyComponent weight={400} size='13.5px'>{
                                (isCamelCase(value as string) && value) ?
                                    camelCaseToWords(value) : value}</TypographyComponent>
                        </StyledBox>
                    ) : (column.isMoney) ?
                        (
                            <StyledBox>
                                <TypographyComponent
                                    weight={400} size='13.5px'>
                                    {formatToUGXMoney(value)}</TypographyComponent>
                            </StyledBox>
                        ) : (column.isStatus) ?
                            (
                                <StyledBox>
                                    <TypographyComponent
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            textTransform: "capitalize"
                                        }}
                                        weight={400} size='13.5px'>
                                        <TimeLineDot status={value} />
                                        {camelCaseToWords(value)}</TypographyComponent>
                                </StyledBox>
                            )
                            : (column.isBoolen) ? (
                                <StyledBox >
                                    {value === "present" ?
                                        <ChipComponent variant='filled' label='Present' icon={<HowToRegOutlinedIcon fontSize='small' />} size='medium' color='success' /> :
                                        <ChipComponent variant='filled' label='Absent' icon={<NoAccountsIcon fontSize='small' />} size='medium' color='warning' />
                                    }
                                </StyledBox>
                            )
                                : (column.isPriority) ? (
                                    <StyledBox >
                                        {value === "high" ?
                                            <ChipComponent variant='filled' label='High' icon={<AccessAlarmsIcon fontSize='small' />} size='medium' color='error' /> :
                                            value === "medium" ?
                                                <ChipComponent variant='filled' label='Medium' icon={<DoNotDisturbAltIcon fontSize='small' />} size='medium' color='secondary' /> :
                                                <ChipComponent variant='filled' label='Low' icon={<SpeedIcon fontSize='small' sx={{ color: theme.palette.background.paper }} />} size='medium' color='success' />
                                        }
                                    </StyledBox>
                                )
                                    : (column.isAction) ? (
                                        <StyledBox >
                                            <ButtonComponent
                                                handleClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                                                    handleClick?.(event, param.row, column)
                                                    setCurrentId(param.row?.id)
                                                }}
                                                sendingRequest={false}
                                                buttonText={column.actionData?.label as string}
                                                variant='outlined'
                                                buttonColor='success'
                                                type='button' />
                                            <PopoverComponent
                                                moduleID={currentID}
                                                handleOptionClicked={handleOptionClicked}
                                                options={(currentOptions) as Array<{ value: string, label: string }>}
                                                anchorEl={anchorEl}
                                                setAnchorEl={setAnchorEl}
                                            />
                                        </StyledBox>
                                    ) : null
        }
    }));

    return (
        <Card sx={{
            width: "100%",
            boxShadow: "none",
            border: `1px solid ${alpha('#000', 0.07)}`,
            borderRadius: 2,
            backgroundColor: alpha('#f8f9fa', 0.8),
        }} >
            <Box>
                <DataGridStyled
                    loading={loading}
                    {...rows}
                    rows={rows || []}
                    columns={columns}
                    onFilterModelChange={handleTableFilter}
                    onPaginationModelChange={handleTablePagination}
                    rowCount={count}
                    paginationMode={paginationMode}
                    filterMode={filterMode}
                    slots={{
                        toolbar: () => (
                            <CustomToolbarWrapper
                                createAction={createAction}
                                exportData={exportData}
                                searchAction={searchAction}
                                importData={importData}
                                header={header}
                                onCreationHandler={() => onCreationHandler?.()}
                                module={module as string}
                                refresh={refresh}
                                status={status}
                                selectedStatus={selectedStatus}
                                onStatusChange={(status) => {
                                    onStatusChange?.(status);
                                }}
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