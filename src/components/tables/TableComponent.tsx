import { DataGridStyled, StyledBox, MultiLineCell, CellPrimaryText, CellSecondaryText } from './Table';
import { GridColDef } from '@mui/x-data-grid';
import {
    alpha,
    Avatar,
    Box,
    Button,
    Card,
    useTheme,
    Tooltip,
    Typography,
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
import TimeLineDot from '../timeLineDots';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import NoAccountsIcon from '@mui/icons-material/NoAccounts';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import TableUtills from './utills';
import BusinessIcon from '@mui/icons-material/Business';
import NoContent from '../noContent';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';

const PRIMARY_COLOR = '#08796C';

// ─── Status colour helper ─────────────────────────────────────────────────────
const getStatusColor = (value: string): { bg: string; text: string; border: string } => {
    const s = (value ?? '').toLowerCase();
    if (s.includes('approved') || s === 'active' || s.includes('completed') || s === 'in stock')
        return { bg: alpha('#16a34a', 0.09), text: '#16a34a', border: alpha('#16a34a', 0.22) };
    if (s.includes('pending') || s.includes('created') || s === 'inactive' || s.includes('process'))
        return { bg: alpha('#d97706', 0.09), text: '#d97706', border: alpha('#d97706', 0.22) };
    if (s.includes('reject') || s === 'blocked' || s === 'disabled' || s === 'disposed' || s.includes('cancel'))
        return { bg: alpha('#dc2626', 0.09), text: '#dc2626', border: alpha('#dc2626', 0.22) };
    if (s.includes('issued') || s.includes('acknowledge') || s.includes('available') || s.includes('repair'))
        return { bg: alpha('#0284c7', 0.09), text: '#0284c7', border: alpha('#0284c7', 0.22) };
    return { bg: alpha('#6366f1', 0.09), text: '#6366f1', border: alpha('#6366f1', 0.22) };
};

// ─── Initials helper ──────────────────────────────────────────────────────────
const getInitials = (name: string): string => {
    if (!name) return '?';
    const parts = String(name).trim().split(' ');
    return parts.length >= 2
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : String(name)[0].toUpperCase();
};

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
                const imgSrc = determineImage(param.row);
                const imgInitials = getInitials(param.row.name ?? param.row.firstName ?? '');
                return (
                    <StyledBox sx={{ p: 0 }}>
                        <Avatar
                            src={imgSrc}
                            alt='profile'
                            sx={{
                                height: 40,
                                width: 40,
                                border: `2px solid ${alpha(PRIMARY_COLOR, 0.15)}`,
                                bgcolor: alpha(PRIMARY_COLOR, 0.1),
                                color: PRIMARY_COLOR,
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                boxShadow: `0 2px 6px ${alpha('#000', 0.08)}`
                            }}
                        >
                            {!imgSrc && imgInitials}
                        </Avatar>
                    </StyledBox>
                );
            }

            // Text/Number columns with multi-line support
            if (column.isText || column.isNumber) {
                // Special handling for 'name' and 'dutyStation' columns
                if (column.label === "name" || column.label === "assignedTo") {
                    const nameInitials = getInitials(value as string);
                    return (
                        <StyledBox>
                            <Avatar sx={{
                                width: 34,
                                height: 34,
                                bgcolor: alpha(PRIMARY_COLOR, 0.1),
                                color: PRIMARY_COLOR,
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                flexShrink: 0,
                                border: `1.5px solid ${alpha(PRIMARY_COLOR, 0.15)}`
                            }}>
                                {nameInitials}
                            </Avatar>
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
                        <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 15, color: alpha('#16a34a', 0.7), flexShrink: 0 }} />
                        <Typography sx={{
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            color: '#16a34a',
                            fontFamily: 'monospace',
                            letterSpacing: '0.02em'
                        }}>
                            {formatToUGXMoney(value)}
                        </Typography>
                    </StyledBox>
                );
            }

            // Status column
            if (column.isStatus) {
                const sc = getStatusColor(value as string);
                return (
                    <StyledBox>
                        <Box sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.75,
                            px: 1.5,
                            py: 0.55,
                            borderRadius: '20px',
                            bgcolor: sc.bg,
                            border: `1px solid ${sc.border}`
                        }}>
                            <TimeLineDot status={value} />
                            <Typography sx={{
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: sc.text,
                                textTransform: 'capitalize',
                                lineHeight: 1
                            }}>
                                {camelCaseToWords(value)}
                            </Typography>
                        </Box>
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
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                                handleClick?.(event, param.row, column);
                                setCurrentId(param.row?.id);
                            }}
                            endIcon={<MoreHorizIcon sx={{ fontSize: '14px !important' }} />}
                            sx={{
                                height: 32,
                                px: 1.5,
                                borderRadius: 1.5,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.78rem',
                                borderColor: alpha(PRIMARY_COLOR, 0.25),
                                color: PRIMARY_COLOR,
                                bgcolor: alpha(PRIMARY_COLOR, 0.03),
                                '&:hover': {
                                    borderColor: PRIMARY_COLOR,
                                    bgcolor: alpha(PRIMARY_COLOR, 0.08)
                                }
                            }}
                        >
                            {column.actionData?.label ?? 'Actions'}
                        </Button>
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
            boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 24px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.04)',
            border: 'none',
            borderRadius: '14px',
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