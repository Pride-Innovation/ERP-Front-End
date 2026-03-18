import { DataGridStyled, StyledBox, MultiLineCell, CellPrimaryText, CellSecondaryText } from './Table';
import { GridColDef } from '@mui/x-data-grid';
import {
    alpha,
    Avatar,
    Box,
    Card,
    useTheme,
    Tooltip
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
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import BusinessIcon from '@mui/icons-material/Business';
import NoContent from '../noContent';

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
    dateRangePicker = false,
}: ITableComponent) => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [currentOptions, setCurrentOptions] = useState<any[]>([]);
    const [currentID, setCurrentId] = useState<string | number>("");
    const theme = useTheme();
    const { handleOptionsFilter } = TableUtills({ moduleName: module });

    const NoRowsOverlay = () => (
        <NoContent item={header.singular} items={header.plural} />
    );

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
        flex: column.label === "image" ? 0.5 :
            column.label === "email" ? 1.5 :
                column.label === "name" ? 1.5 : 1,
        minWidth: column.label === "image" ? 80 :
            column.label === "action" ? 120 : 150,
        renderCell: (param) => {
            const value = param.row[column.label];

            // Image column
            if (column.isImage) {
                return (
                    <StyledBox sx={{ p: 0 }}>
                        <Avatar
                            src={determineImage(param.row)}
                            alt='profile'
                            sx={{
                                height: 48,
                                width: 48,
                                border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                boxShadow: `0 2px 4px ${alpha('#000', 0.08)}`
                            }}
                        />
                    </StyledBox>
                );
            }

            // Text/Number columns with multi-line support
            if (column.isText || column.isNumber) {
                // Special handling for 'name' and 'dutyStation' columns
                if (column.label === "name" || column.label === "assignedTo") {
                    return (
                        <StyledBox>
                            <PersonOutlineIcon
                                fontSize='small'
                                sx={{
                                    color: theme.palette.primary.main,
                                    flexShrink: 0
                                }}
                            />
                            <MultiLineCell>
                                <CellPrimaryText>{value}</CellPrimaryText>
                                {param.row.title && (
                                    <CellSecondaryText>{param.row.title}</CellSecondaryText>
                                )}
                            </MultiLineCell>
                        </StyledBox>
                    );
                }

                if (column.label === "dutyStation") {
                    return (
                        <StyledBox>
                            <BusinessIcon
                                fontSize='small'
                                sx={{
                                    color: theme.palette.secondary.main,
                                    flexShrink: 0
                                }}
                            />
                            <MultiLineCell>
                                <CellPrimaryText>{value}</CellPrimaryText>
                                {param.row.department && (
                                    <CellSecondaryText>{param.row.department}</CellSecondaryText>
                                )}
                            </MultiLineCell>
                        </StyledBox>
                    );
                }

                // Email column
                if (column.label === "email") {
                    return (
                        <Tooltip title={value} arrow>
                            <StyledBox>
                                <MailOutlineIcon
                                    fontSize='small'
                                    sx={{
                                        color: theme.palette.secondary.main,
                                        flexShrink: 0
                                    }}
                                />
                                <TypographyComponent
                                    weight={400}
                                    size='0.875rem'
                                    sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {value}
                                </TypographyComponent>
                            </StyledBox>
                        </Tooltip>
                    );
                }

                // Default text rendering
                return (
                    <StyledBox>
                        <TypographyComponent
                            weight={400}
                            size='0.875rem'
                            sx={{ color: '#1F2937' }}
                        >
                            {(isCamelCase(value as string) && value) ?
                                camelCaseToWords(value) : value}
                        </TypographyComponent>
                    </StyledBox>
                );
            }

            // Money column
            if (column.isMoney) {
                return (
                    <StyledBox>
                        <TypographyComponent
                            weight={500}
                            size='0.875rem'
                            sx={{
                                color: theme.palette.success.main,
                                fontFamily: 'monospace'
                            }}
                        >
                            {formatToUGXMoney(value)}
                        </TypographyComponent>
                    </StyledBox>
                );
            }

            // Status column
            if (column.isStatus) {
                return (
                    <StyledBox>
                        <TimeLineDot status={value} />
                        <TypographyComponent
                            weight={500}
                            size='0.875rem'
                            sx={{
                                textTransform: 'capitalize',
                                color: '#1F2937'
                            }}
                        >
                            {camelCaseToWords(value)}
                        </TypographyComponent>
                    </StyledBox>
                );
            }

            // Boolean column (availability)
            if (column.isBoolen) {
                return (
                    <StyledBox>
                        {value === "present" ?
                            <ChipComponent
                                variant='filled'
                                label='Present'
                                icon={<HowToRegOutlinedIcon fontSize='small' />}
                                size='medium'
                                color='success'
                                sx={{
                                    fontWeight: 500,
                                    fontSize: '0.75rem',
                                    height: 28
                                }}
                            /> :
                            <ChipComponent
                                variant='filled'
                                label='Absent'
                                icon={<NoAccountsIcon fontSize='small' />}
                                size='medium'
                                color='warning'
                                sx={{
                                    fontWeight: 500,
                                    fontSize: '0.75rem',
                                    height: 28
                                }}
                            />
                        }
                    </StyledBox>
                );
            }

            // Priority column
            if (column.isPriority) {
                return (
                    <StyledBox>
                        {value === "high" ?
                            <ChipComponent
                                variant='filled'
                                label='High'
                                icon={<AccessAlarmsIcon fontSize='small' />}
                                size='medium'
                                color='error'
                                sx={{ fontWeight: 500, fontSize: '0.75rem', height: 28 }}
                            /> :
                            value === "medium" ?
                                <ChipComponent
                                    variant='filled'
                                    label='Medium'
                                    icon={<DoNotDisturbAltIcon fontSize='small' />}
                                    size='medium'
                                    color='secondary'
                                    sx={{ fontWeight: 500, fontSize: '0.75rem', height: 28 }}
                                /> :
                                <ChipComponent
                                    variant='filled'
                                    label='Low'
                                    icon={<SpeedIcon fontSize='small' />}
                                    size='medium'
                                    color='success'
                                    sx={{ fontWeight: 500, fontSize: '0.75rem', height: 28 }}
                                />
                        }
                    </StyledBox>
                );
            }

            // Action column
            if (column.isAction) {
                return (
                    <StyledBox>
                        <ButtonComponent
                            handleClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                                handleClick?.(event, param.row, column);
                                setCurrentId(param.row?.id);
                            }}
                            sendingRequest={false}
                            buttonText={column.actionData?.label as string}
                            variant='outlined'
                            buttonColor='success'
                            type='button'
                        />
                        <PopoverComponent
                            moduleID={currentID}
                            handleOptionClicked={handleOptionClicked}
                            options={currentOptions as Array<{ value: string, label: string }>}
                            anchorEl={anchorEl}
                            setAnchorEl={setAnchorEl}
                        />
                    </StyledBox>
                );
            }

            return null;
        }
    }));

    return (
        <Card sx={{
            width: "100%",
            boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.04)',
            border: `1px solid ${alpha('#000', 0.06)}`,
            borderRadius: 3,
            backgroundColor: '#FFFFFF',
            overflow: 'hidden'
        }}>
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
                    getRowHeight={() => 'auto'}
                    slots={{
                        noRowsOverlay: NoRowsOverlay,
                        toolbar: () => (
                            <CustomToolbarWrapper
                                dateRangePicker={dateRangePicker}
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
                            />
                        )
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
                    sx={{
                        '& .MuiDataGrid-cell': {
                            py: 1.5,
                        }
                    }}
                />
            </Box>
        </Card>
    );
};

export default TableComponent;