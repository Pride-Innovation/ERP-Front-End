import { StyledBox, MultiLineCell, CellPrimaryText, CellSecondaryText } from './Table';
import {
    alpha,
    Avatar,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
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
import { useMemo, useState } from 'react';
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
import { useDebounce } from '../../hooks/useDebounce';

const PRIMARY_COLOR = '#08796C';
const HEADER_TO = '#065E53';
const BORDER_COLOR = '#EEF2F7';
const HOVER_BG = '#F0FDF9';
const ROW_EVEN = '#FAFBFC';

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

type SortDir = 'asc' | 'desc';

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
    endPoint = 'users',
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
    const [currentID, setCurrentId] = useState<string | number>('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortField, setSortField] = useState<string>('');
    const [sortDir, setSortDir] = useState<SortDir>('asc');
    const [searchValue, setSearchValue] = useState('');
    const debouncedSearch = useDebounce(searchValue, 500);

    const { handleOptionsFilter } = TableUtills({ moduleName: module });
    const { handleTableFilter } = CustomTextFilterOperator({ endPoint, params });
    const { handleTablePagination } = CustomTablePagination({ endPoint, params, selectedStatus });

    // ── Server-side: fire pagination when page/rowsPerPage changes ────────────
    const handlePageChange = (_: unknown, newPage: number) => {
        setPage(newPage);
        if (paginationMode === 'server') {
            handleTablePagination({ page: newPage, pageSize: rowsPerPage } as any);
        }
    };

    const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const size = parseInt(e.target.value, 10);
        setRowsPerPage(size);
        setPage(0);
        if (paginationMode === 'server') {
            handleTablePagination({ page: 0, pageSize: size } as any);
        }
    };

    // ── Server-side: fire filter when search debounces ────────────────────────
    const handleSearch = (value: string) => {
        setSearchValue(value);
        setPage(0);
        if (filterMode === 'server' && value.trim()) {
            handleTableFilter({
                items: [{ field: 'name', operator: 'contains', value: value.trim(), id: 1 }],
            } as any);
        }
    };

    // ── Sort handler ──────────────────────────────────────────────────────────
    const handleSort = (field: string) => {
        const isAsc = sortField === field && sortDir === 'asc';
        setSortDir(isAsc ? 'desc' : 'asc');
        setSortField(field);
    };

    // ── Client-side filter + sort + paginate ──────────────────────────────────
    const processedRows = useMemo(() => {
        let data = [...(rows ?? [])];

        // client-side search
        if (filterMode === 'client' && debouncedSearch) {
            const q = debouncedSearch.toLowerCase();
            data = data.filter(row =>
                Object.values(row as object).some(v => String(v ?? '').toLowerCase().includes(q))
            );
        }

        // sort
        if (sortField) {
            data = [...data].sort((a: any, b: any) => {
                const av = a[sortField] ?? '';
                const bv = b[sortField] ?? '';
                const result = String(av).localeCompare(String(bv), undefined, { numeric: true });
                return sortDir === 'asc' ? result : -result;
            });
        }

        return data;
    }, [rows, filterMode, debouncedSearch, sortField, sortDir]);

    const pagedRows = useMemo(() => {
        if (paginationMode === 'client') {
            return processedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
        }
        return processedRows;
    }, [processedRows, page, rowsPerPage, paginationMode]);

    const totalRows = paginationMode === 'server' ? count : processedRows.length;

    // ── Action column helper ──────────────────────────────────────────────────
    const handleActionClick = (
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

    // ── Cell renderers (same logic as before, now return ReactNode) ───────────
    const renderCell = (column: any, row: any) => {
        const value = row[column.label];

        if (column.isImage) {
            const imgSrc = determineImage(row);
            const imgInitials = getInitials(row.name ?? row.firstName ?? '');
            return (
                <Avatar
                    src={imgSrc}
                    alt="profile"
                    sx={{
                        height: 38, width: 38,
                        border: `2px solid ${alpha(PRIMARY_COLOR, 0.15)}`,
                        bgcolor: alpha(PRIMARY_COLOR, 0.1),
                        color: PRIMARY_COLOR,
                        fontSize: '0.8rem', fontWeight: 700,
                        boxShadow: `0 2px 6px ${alpha('#000', 0.08)}`,
                    }}
                >
                    {!imgSrc && imgInitials}
                </Avatar>
            );
        }

        if (column.isText || column.isNumber) {
            if (column.label === 'name' || column.label === 'assignedTo') {
                return (
                    <StyledBox>
                        <Avatar sx={{
                            width: 32, height: 32,
                            bgcolor: alpha(PRIMARY_COLOR, 0.1),
                            color: PRIMARY_COLOR,
                            fontSize: '0.72rem', fontWeight: 800, flexShrink: 0,
                            border: `1.5px solid ${alpha(PRIMARY_COLOR, 0.15)}`,
                        }}>
                            {getInitials(value as string)}
                        </Avatar>
                        <MultiLineCell>
                            <CellPrimaryText>{value}</CellPrimaryText>
                            {row.title && <CellSecondaryText>{row.title}</CellSecondaryText>}
                        </MultiLineCell>
                    </StyledBox>
                );
            }

            if (column.label === 'dutyStation') {
                return (
                    <StyledBox>
                        <BusinessIcon fontSize="small" sx={{ color: '#64748B', flexShrink: 0 }} />
                        <MultiLineCell>
                            <CellPrimaryText>{value}</CellPrimaryText>
                            {row.department && <CellSecondaryText>{row.department}</CellSecondaryText>}
                        </MultiLineCell>
                    </StyledBox>
                );
            }

            if (column.label === 'email') {
                return (
                    <Tooltip title={value} arrow>
                        <StyledBox>
                            <MailOutlineIcon fontSize="small" sx={{ color: '#64748B', flexShrink: 0 }} />
                            <TypographyComponent weight={400} size="0.875rem"
                                sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {value}
                            </TypographyComponent>
                        </StyledBox>
                    </Tooltip>
                );
            }

            return (
                <TypographyComponent weight={400} size="0.875rem" sx={{ color: '#1F2937' }}>
                    {(isCamelCase(value as string) && value) ? camelCaseToWords(value) : value}
                </TypographyComponent>
            );
        }

        if (column.isMoney) {
            return (
                <StyledBox>
                    <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 15, color: alpha('#16a34a', 0.7), flexShrink: 0 }} />
                    <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#16a34a', fontFamily: 'monospace' }}>
                        {formatToUGXMoney(value)}
                    </Typography>
                </StyledBox>
            );
        }

        if (column.isStatus) {
            const sc = getStatusColor(value as string);
            return (
                <Box sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 0.75,
                    px: 1.5, py: 0.55, borderRadius: '20px',
                    bgcolor: sc.bg, border: `1px solid ${sc.border}`,
                }}>
                    <TimeLineDot status={value} />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: sc.text, textTransform: 'capitalize', lineHeight: 1 }}>
                        {camelCaseToWords(value)}
                    </Typography>
                </Box>
            );
        }

        if (column.isBoolen) {
            return value === 'present'
                ? <ChipComponent variant="filled" label="Present" icon={<HowToRegOutlinedIcon fontSize="small" />} size="medium" color="success" sx={{ fontWeight: 500, fontSize: '0.75rem', height: 28 }} />
                : <ChipComponent variant="filled" label="Absent" icon={<NoAccountsIcon fontSize="small" />} size="medium" color="warning" sx={{ fontWeight: 500, fontSize: '0.75rem', height: 28 }} />;
        }

        if (column.isPriority) {
            if (value === 'high') return <Chip label="High" icon={<AccessAlarmsIcon fontSize="small" />} size="small" color="error" sx={{ fontWeight: 600 }} />;
            if (value === 'medium') return <Chip label="Medium" icon={<DoNotDisturbAltIcon fontSize="small" />} size="small" color="default" sx={{ fontWeight: 600 }} />;
            return <Chip label="Low" icon={<SpeedIcon fontSize="small" />} size="small" color="success" sx={{ fontWeight: 600 }} />;
        }

        if (column.isAction) {
            return (
                <>
                    <Button
                        size="small"
                        variant="outlined"
                        endIcon={<MoreHorizIcon sx={{ fontSize: '14px !important' }} />}
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            handleActionClick(e, row, column);
                            setCurrentId(row?.id);
                        }}
                        sx={{
                            height: 32, px: 1.5, borderRadius: 1.5,
                            textTransform: 'none', fontWeight: 600, fontSize: '0.78rem',
                            borderColor: alpha(PRIMARY_COLOR, 0.25),
                            color: PRIMARY_COLOR,
                            bgcolor: alpha(PRIMARY_COLOR, 0.03),
                            '&:hover': { borderColor: PRIMARY_COLOR, bgcolor: alpha(PRIMARY_COLOR, 0.08) },
                        }}
                    >
                        {column.actionData?.label ?? 'Actions'}
                    </Button>
                    <PopoverComponent
                        moduleID={currentID}
                        handleOptionClicked={handleOptionClicked}
                        options={currentOptions as Array<{ value: string; label: string }>}
                        anchorEl={anchorEl}
                        setAnchorEl={setAnchorEl}
                    />
                </>
            );
        }

        return null;
    };

    return (
        <Card sx={{
            width: '100%',
            boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 24px rgba(0,0,0,0.05)',
            border: 'none',
            borderRadius: '14px',
            overflow: 'hidden',
        }}>
            {/* ── Toolbar ─────────────────────────────────────────────── */}
            <CustomToolbarWrapper
                header={header}
                onCreationHandler={() => onCreationHandler?.()}
                module={module as string}
                createAction={createAction}
                exportData={exportData}
                importData={importData}
                searchAction={searchAction}
                onSearch={handleSearch}
                rows={processedRows}
                refresh={refresh}
                status={status}
                selectedStatus={selectedStatus}
                onStatusChange={onStatusChange}
                dateRangePicker={dateRangePicker}
            />

            {/* ── Table ───────────────────────────────────────────────── */}
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
                <Table stickyHeader size="small">

                    {/* ── Header ────────────────────────────────────────── */}
                    <TableHead>
                        <TableRow>
                            {columnHeaders.map((col) => (
                                <TableCell
                                    key={col.label}
                                    sortDirection={sortField === col.label ? sortDir : false}
                                    sx={{
                                        background: `linear-gradient(120deg, ${PRIMARY_COLOR} 0%, ${HEADER_TO} 100%)`,
                                        color: 'rgba(255,255,255,0.92)',
                                        fontWeight: 700,
                                        fontSize: '0.68rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.07em',
                                        whiteSpace: 'nowrap',
                                        borderBottom: `2px solid ${alpha('#fff', 0.15)}`,
                                        py: 1.5,
                                        px: 2.5,
                                        '&:first-of-type': { borderRadius: 0 },
                                    }}
                                >
                                    {!col.isAction ? (
                                        <TableSortLabel
                                            active={sortField === col.label}
                                            direction={sortField === col.label ? sortDir : 'asc'}
                                            onClick={() => handleSort(col.label)}
                                            sx={{
                                                color: 'rgba(255,255,255,0.92) !important',
                                                '& .MuiTableSortLabel-icon': { color: 'rgba(255,255,255,0.7) !important' },
                                                '&:hover': { color: '#fff !important' },
                                            }}
                                        >
                                            {camelCaseToWords(col.label)}
                                        </TableSortLabel>
                                    ) : (
                                        camelCaseToWords(col.label)
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    {/* ── Body ──────────────────────────────────────────── */}
                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={columnHeaders.length} sx={{ textAlign: 'center', py: 5, border: 'none' }}>
                                    <CircularProgress size={32} sx={{ color: PRIMARY_COLOR }} />
                                </TableCell>
                            </TableRow>
                        )}

                        {!loading && pagedRows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={columnHeaders.length} sx={{ border: 'none', p: 0 }}>
                                    <NoContent item={header.singular} items={header.plural} />
                                </TableCell>
                            </TableRow>
                        )}

                        {!loading && pagedRows.map((row: any, rowIndex: number) => (
                            <TableRow
                                key={row.id ?? rowIndex}
                                sx={{
                                    bgcolor: rowIndex % 2 === 1 ? ROW_EVEN : '#fff',
                                    borderBottom: `1px solid ${BORDER_COLOR}`,
                                    transition: 'background-color 0.12s, box-shadow 0.12s',
                                    '&:hover': {
                                        bgcolor: HOVER_BG,
                                        boxShadow: `inset 3px 0 0 ${PRIMARY_COLOR}`,
                                    },
                                    '&:last-child td': { borderBottom: 'none' },
                                }}
                            >
                                {columnHeaders.map((col) => (
                                    <TableCell
                                        key={col.label}
                                        sx={{
                                            py: 1.5,
                                            px: 2.5,
                                            fontSize: '0.875rem',
                                            color: '#0F172A',
                                            borderBottom: 'none',
                                            maxWidth: col.label === 'email' ? 200 : 'none',
                                        }}
                                    >
                                        {renderCell(col, row)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* ── Pagination ──────────────────────────────────────────── */}
            <Box sx={{ borderTop: `1px solid ${BORDER_COLOR}`, bgcolor: ROW_EVEN }}>
                <TablePagination
                    component="div"
                    count={totalRows}
                    page={page}
                    onPageChange={handlePageChange}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    rowsPerPageOptions={[5, 10, 25, 50, 100]}
                    sx={{
                        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                            fontSize: '0.8125rem', color: '#64748B', margin: 0,
                        },
                        '& .MuiTablePagination-select': { fontSize: '0.8125rem' },
                        '& .MuiIconButton-root': {
                            borderRadius: 1.5,
                            '&:hover': { bgcolor: alpha(PRIMARY_COLOR, 0.06) },
                        },
                    }}
                />
            </Box>
        </Card>
    );
};

export default TableComponent;
