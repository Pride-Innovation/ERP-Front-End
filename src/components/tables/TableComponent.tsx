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
import PopoverComponent from '../forms/Popover';
import CustomToolbarWrapper from './TableToolBar';
import CustomTextFilterOperator from './TableFilters';
import { useMemo, useState } from 'react';
import CustomTablePagination from './TablePagination';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import NoAccountsIcon from '@mui/icons-material/NoAccounts';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import TableUtills from './utills';
import BusinessIcon from '@mui/icons-material/Business';
import NoContent from '../noContent';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RemoveIcon from '@mui/icons-material/Remove';
import { useDebounce } from '../../hooks/useDebounce';

const PRIMARY   = '#08796C';
const PRIMARY_8 = alpha(PRIMARY, 0.08);
const BORDER    = '#EFF2F6';
const HEADER_BG = '#F8FAFC';
const ROW_EVEN  = '#FAFBFC';
const HOVER_BG  = alpha(PRIMARY, 0.04);
const EMPTY_COL = '—';

// ─── Status colour map ────────────────────────────────────────────────────────
const getStatusMeta = (raw: string): { bg: string; text: string; border: string; dot: string } => {
    const s = (raw ?? '').toLowerCase();
    if (s.includes('approved') || s === 'active' || s.includes('complet') || s === 'in stock' || s === 'instore')
        return { bg: alpha('#16a34a', 0.08), text: '#15803d', border: alpha('#16a34a', 0.18), dot: '#16a34a' };
    if (s.includes('pending') || s.includes('created') || s === 'inactive' || s.includes('process') || s === 'requireupdate')
        return { bg: alpha('#d97706', 0.08), text: '#b45309', border: alpha('#d97706', 0.18), dot: '#d97706' };
    if (s.includes('reject') || s === 'blocked' || s === 'disabled' || s.includes('cancel') || s === 'disposed')
        return { bg: alpha('#dc2626', 0.08), text: '#b91c1c', border: alpha('#dc2626', 0.18), dot: '#dc2626' };
    if (s.includes('issued') || s.includes('acknowledge') || s.includes('available') || s.includes('repair') || s === 'inmaintenance')
        return { bg: alpha('#0284c7', 0.08), text: '#0369a1', border: alpha('#0284c7', 0.18), dot: '#0284c7' };
    return { bg: alpha('#7c3aed', 0.08), text: '#6d28d9', border: alpha('#7c3aed', 0.18), dot: '#7c3aed' };
};

// ─── Avatar colour from string ────────────────────────────────────────────────
const AVATAR_COLORS = ['#0891b2', '#059669', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0369a1', '#9333ea'];
const avatarColor = (name: string) => {
    const n = (name ?? '').charCodeAt(0) || 0;
    return AVATAR_COLORS[n % AVATAR_COLORS.length];
};

// ─── Initials ─────────────────────────────────────────────────────────────────
const initials = (name: string): string => {
    if (!name) return '?';
    const parts = String(name).trim().split(' ').filter(Boolean);
    return parts.length >= 2
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : String(name)[0].toUpperCase();
};

// ─── Safe value ───────────────────────────────────────────────────────────────
const safeStr = (v: unknown): string | null => {
    if (v === null || v === undefined || v === '' || String(v).toLowerCase() === 'null') return null;
    if (String(v).includes('undefined')) return null;
    return String(v);
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
    columnFilters = [],
    onApplyFilters,
    tableIcon,
    createPermission,
    onExport,
}: ITableComponent) => {
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [currentOptions, setCurrentOptions] = useState<any[]>([]);
    const [currentID, setCurrentId] = useState<string | number>('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortField, setSortField] = useState<string>('');
    const [sortDir, setSortDir] = useState<SortDir>('asc');
    const [searchValue, setSearchValue] = useState('');
    const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
    const debouncedSearch = useDebounce(searchValue, 400);

    const { handleOptionsFilter } = TableUtills({ moduleName: module });
    const { handleTableFilter } = CustomTextFilterOperator({ endPoint, params });
    const { handleTablePagination } = CustomTablePagination({ endPoint, params, selectedStatus, filterParams: activeFilters });

    const handleFiltersApplied = (filters: Record<string, any>) => {
        setActiveFilters(filters);
        setPage(0);
        onApplyFilters?.(filters);
    };

    const handlePageChange = (_: unknown, newPage: number) => {
        setPage(newPage);
        if (paginationMode === 'server') handleTablePagination({ page: newPage, pageSize: rowsPerPage } as any);
    };

    const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const size = parseInt(e.target.value, 10);
        setRowsPerPage(size);
        setPage(0);
        if (paginationMode === 'server') handleTablePagination({ page: 0, pageSize: size } as any);
    };

    const handleSearch = (value: string) => {
        setSearchValue(value);
        setPage(0);
        if (filterMode === 'server' && value.trim()) {
            handleTableFilter({ items: [{ field: 'name', operator: 'contains', value: value.trim(), id: 1 }] } as any);
        }
    };

    const handleSort = (field: string) => {
        const isAsc = sortField === field && sortDir === 'asc';
        setSortDir(isAsc ? 'desc' : 'asc');
        setSortField(field);
    };

    const processedRows = useMemo(() => {
        let data = [...(rows ?? [])];
        if (filterMode === 'client' && debouncedSearch) {
            const q = debouncedSearch.toLowerCase();
            data = data.filter(row =>
                Object.values(row as object).some(v => String(v ?? '').toLowerCase().includes(q))
            );
        }
        if (sortField) {
            data = [...data].sort((a: any, b: any) => {
                const result = String(a[sortField] ?? '').localeCompare(String(b[sortField] ?? ''), undefined, { numeric: true });
                return sortDir === 'asc' ? result : -result;
            });
        }
        return data;
    }, [rows, filterMode, debouncedSearch, sortField, sortDir]);

    const pagedRows = useMemo(() => {
        if (paginationMode === 'client') return processedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
        return processedRows;
    }, [processedRows, page, rowsPerPage, paginationMode]);

    const totalRows = paginationMode === 'server' ? count : processedRows.length;

    const handleActionClick = (e: React.MouseEvent<HTMLButtonElement>, row: any, column: any) => {
        setAnchorEl(e.currentTarget);
        setCurrentOptions(handleOptionsFilter(column, filterOptions, row, module as string, optionsfilterParams || {}));
    };

    // ── Cell renderers ────────────────────────────────────────────────────────
    const renderCell = (column: any, row: any) => {
        const raw   = row[column.label];
        const value = safeStr(raw);

        // ── Image ──────────────────────────────────────────────────────────────
        if (column.isImage) {
            const src  = determineImage(row);
            const name = row.name ?? row.firstName ?? '';
            const bg   = avatarColor(name);
            return (
                <Avatar
                    src={src}
                    alt={name}
                    sx={{
                        width: 36, height: 36,
                        bgcolor: alpha(bg, 0.15), color: bg,
                        fontSize: '0.78rem', fontWeight: 700,
                        border: `2px solid ${alpha(bg, 0.2)}`,
                        boxShadow: `0 1px 4px ${alpha('#000', 0.08)}`,
                    }}
                >
                    {!src && initials(name)}
                </Avatar>
            );
        }

        // ── Name / assignedTo ──────────────────────────────────────────────────
        if ((column.isText || column.isNumber) && (column.label === 'name' || column.label === 'assignedTo')) {
            const display = value ?? EMPTY_COL;
            const bg = avatarColor(display);
            return (
                <StyledBox>
                    <Avatar sx={{
                        width: 30, height: 30, flexShrink: 0,
                        bgcolor: alpha(bg, 0.12), color: bg,
                        fontSize: '0.7rem', fontWeight: 800,
                        border: `1.5px solid ${alpha(bg, 0.18)}`,
                    }}>
                        {display !== EMPTY_COL ? initials(display) : '?'}
                    </Avatar>
                    <MultiLineCell>
                        <CellPrimaryText>{display}</CellPrimaryText>
                        {row.title && <CellSecondaryText>{row.title}</CellSecondaryText>}
                    </MultiLineCell>
                </StyledBox>
            );
        }

        // ── Duty station ───────────────────────────────────────────────────────
        if ((column.isText || column.isNumber) && column.label === 'dutyStation') {
            return (
                <StyledBox>
                    <BusinessIcon sx={{ fontSize: 15, color: '#94A3B8', flexShrink: 0 }} />
                    <MultiLineCell>
                        <CellPrimaryText>{value ?? EMPTY_COL}</CellPrimaryText>
                        {row.department && <CellSecondaryText>{row.department}</CellSecondaryText>}
                    </MultiLineCell>
                </StyledBox>
            );
        }

        // ── Email ──────────────────────────────────────────────────────────────
        if ((column.isText || column.isNumber) && column.label === 'email') {
            return (
                <Tooltip title={value ?? ''} arrow placement="top">
                    <StyledBox sx={{ maxWidth: 200 }}>
                        <MailOutlineIcon sx={{ fontSize: 14, color: '#94A3B8', flexShrink: 0 }} />
                        <Typography sx={{
                            fontSize: '0.82rem', color: '#334155',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                            {value ?? EMPTY_COL}
                        </Typography>
                    </StyledBox>
                </Tooltip>
            );
        }

        // ── Approver / requestedBy person field ────────────────────────────────
        if ((column.isText || column.isNumber) && (column.label === 'approver' || column.label === 'requestedBy')) {
            if (!value) {
                return (
                    <StyledBox>
                        <PersonOutlineIcon sx={{ fontSize: 14, color: '#CBD5E1', flexShrink: 0 }} />
                        <Typography sx={{ fontSize: '0.8rem', color: '#CBD5E1', fontStyle: 'italic' }}>
                            {column.label === 'approver' ? 'Unassigned' : EMPTY_COL}
                        </Typography>
                    </StyledBox>
                );
            }
            const bg = avatarColor(value);
            return (
                <StyledBox>
                    <Avatar sx={{
                        width: 26, height: 26, flexShrink: 0,
                        bgcolor: alpha(bg, 0.12), color: bg,
                        fontSize: '0.65rem', fontWeight: 800,
                        border: `1.5px solid ${alpha(bg, 0.18)}`,
                    }}>
                        {initials(value)}
                    </Avatar>
                    <Typography sx={{ fontSize: '0.825rem', fontWeight: 500, color: '#1E293B', lineHeight: 1.3 }}>
                        {value}
                    </Typography>
                </StyledBox>
            );
        }

        // ── Generic text / number ──────────────────────────────────────────────
        if (column.isText || column.isNumber) {
            const display = value !== null ? ((isCamelCase(value) && value) ? camelCaseToWords(value) : value) : EMPTY_COL;
            return (
                <Typography sx={{ fontSize: '0.825rem', color: display === EMPTY_COL ? '#CBD5E1' : '#334155', lineHeight: 1.4 }}>
                    {display}
                </Typography>
            );
        }

        // ── Money ──────────────────────────────────────────────────────────────
        if (column.isMoney) {
            return (
                <StyledBox>
                    <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 14, color: alpha('#16a34a', 0.6), flexShrink: 0 }} />
                    <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#15803d', fontFamily: 'monospace', letterSpacing: '-0.01em' }}>
                        {value !== null ? formatToUGXMoney(raw) : EMPTY_COL}
                    </Typography>
                </StyledBox>
            );
        }

        // ── Status badge ───────────────────────────────────────────────────────
        if (column.isStatus) {
            if (!value) return <Typography sx={{ color: '#CBD5E1', fontSize: '0.8rem' }}>{EMPTY_COL}</Typography>;
            const meta = getStatusMeta(value);
            return (
                <Box sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 0.6,
                    px: 1.25, py: 0.45, borderRadius: '20px',
                    bgcolor: meta.bg, border: `1px solid ${meta.border}`,
                    maxWidth: 'fit-content',
                }}>
                    <Box sx={{
                        width: 6, height: 6, borderRadius: '50%',
                        bgcolor: meta.dot, flexShrink: 0,
                        boxShadow: `0 0 0 2px ${alpha(meta.dot, 0.2)}`,
                    }} />
                    <Typography sx={{
                        fontSize: '0.725rem', fontWeight: 600, color: meta.text,
                        textTransform: 'capitalize', lineHeight: 1, whiteSpace: 'nowrap',
                    }}>
                        {camelCaseToWords(value)}
                    </Typography>
                </Box>
            );
        }

        // ── Boolean (availability) ────────────────────────────────────────────
        if (column.isBoolen) {
            return value === 'present'
                ? <ChipComponent variant="filled" label="Present" icon={<HowToRegOutlinedIcon fontSize="small" />} size="medium" color="success" sx={{ fontWeight: 600, fontSize: '0.75rem', height: 26 }} />
                : <ChipComponent variant="filled" label="Absent"  icon={<NoAccountsIcon fontSize="small" />}     size="medium" color="warning" sx={{ fontWeight: 600, fontSize: '0.75rem', height: 26 }} />;
        }

        // ── Priority ──────────────────────────────────────────────────────────
        if (column.isPriority) {
            const priorities: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
                high:   { label: 'High',   color: '#b91c1c', bg: alpha('#dc2626', 0.08), icon: <TrendingUpIcon   sx={{ fontSize: 13 }} /> },
                medium: { label: 'Medium', color: '#b45309', bg: alpha('#d97706', 0.08), icon: <RemoveIcon       sx={{ fontSize: 13 }} /> },
                low:    { label: 'Low',    color: '#15803d', bg: alpha('#16a34a', 0.08), icon: <TrendingDownIcon  sx={{ fontSize: 13 }} /> },
            };
            const key = (value ?? '').toLowerCase();
            const p = priorities[key] ?? priorities.low;
            return (
                <Box sx={{
                    display: 'inline-flex', alignItems: 'center', gap: 0.5,
                    px: 1.1, py: 0.4, borderRadius: '6px',
                    bgcolor: p.bg, color: p.color,
                }}>
                    {p.icon}
                    <Typography sx={{ fontSize: '0.73rem', fontWeight: 700, color: p.color, lineHeight: 1 }}>
                        {p.label}
                    </Typography>
                </Box>
            );
        }

        // ── Action button ─────────────────────────────────────────────────────
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
                            height: 30, px: 1.25, borderRadius: '8px',
                            textTransform: 'none', fontWeight: 600, fontSize: '0.76rem',
                            borderColor: alpha(PRIMARY, 0.22),
                            color: PRIMARY,
                            bgcolor: 'transparent',
                            minWidth: 0,
                            '&:hover': {
                                borderColor: PRIMARY,
                                bgcolor: PRIMARY_8,
                                boxShadow: `0 2px 8px ${alpha(PRIMARY, 0.15)}`,
                            },
                            transition: 'all 0.15s',
                        }}
                    >
                        {column.actionData?.label ?? 'Options'}
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
        <Card elevation={0} sx={{
            width: '100%',
            border: `1px solid ${BORDER}`,
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.04)',
        }}>

            {/* ── Toolbar ────────────────────────────────────────────────────── */}
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
                columnFilters={columnFilters}
                onApplyFilters={handleFiltersApplied}
                tableIcon={tableIcon}
                createPermission={createPermission}
                onExport={onExport}
            />

            {/* ── Table ──────────────────────────────────────────────────────── */}
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0 }}>
                <Table stickyHeader size="small">

                    {/* ── Header ───────────────────────────────────────────── */}
                    <TableHead>
                        <TableRow>
                            {columnHeaders.map((col, i) => (
                                <TableCell
                                    key={col.label}
                                    sortDirection={sortField === col.label ? sortDir : false}
                                    sx={{
                                        bgcolor: HEADER_BG,
                                        color: '#64748B',
                                        fontWeight: 700,
                                        fontSize: '0.67rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.08em',
                                        whiteSpace: 'nowrap',
                                        py: 1.4,
                                        px: 2,
                                        borderBottom: `2px solid ${BORDER}`,
                                        borderRight: i < columnHeaders.length - 1 ? `1px solid ${BORDER}` : 'none',
                                        '&:first-of-type': { pl: 2.5 },
                                        '&:last-of-type': { pr: 2.5 },
                                    }}
                                >
                                    {!col.isAction ? (
                                        <TableSortLabel
                                            active={sortField === col.label}
                                            direction={sortField === col.label ? sortDir : 'asc'}
                                            onClick={() => handleSort(col.label)}
                                            sx={{
                                                color: sortField === col.label ? `${PRIMARY} !important` : '#64748B',
                                                '& .MuiTableSortLabel-icon': {
                                                    color: `${PRIMARY} !important`,
                                                    opacity: sortField === col.label ? 1 : 0,
                                                    transition: 'opacity 0.15s',
                                                },
                                                '&:hover': { color: `${PRIMARY} !important` },
                                                '&:hover .MuiTableSortLabel-icon': { opacity: 0.5 },
                                                gap: 0.25,
                                            }}
                                        >
                                            {camelCaseToWords(col.label)}
                                        </TableSortLabel>
                                    ) : (
                                        <Typography sx={{ fontSize: '0.67rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                            {camelCaseToWords(col.label)}
                                        </Typography>
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    {/* ── Body ─────────────────────────────────────────────── */}
                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={columnHeaders.length} sx={{ textAlign: 'center', py: 6, border: 'none' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                                        <CircularProgress size={28} thickness={3} sx={{ color: PRIMARY }} />
                                        <Typography sx={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: 500 }}>
                                            Loading records…
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )}

                        {!loading && pagedRows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={columnHeaders.length} sx={{ border: 'none', p: 0 }}>
                                    <NoContent
                                        item={header.singular}
                                        items={header.plural}
                                        filtered={Object.keys(activeFilters).length > 0 || !!searchValue}
                                    />
                                </TableCell>
                            </TableRow>
                        )}

                        {!loading && pagedRows.map((row: any, rowIndex: number) => (
                            <TableRow
                                key={row.id ?? rowIndex}
                                sx={{
                                    bgcolor: rowIndex % 2 === 1 ? ROW_EVEN : '#fff',
                                    transition: 'background-color 0.1s, box-shadow 0.1s',
                                    '&:hover': {
                                        bgcolor: HOVER_BG,
                                        boxShadow: `inset 3px 0 0 ${PRIMARY}`,
                                    },
                                    '& td': {
                                        borderBottom: `1px solid ${BORDER}`,
                                    },
                                    '&:last-child td': { borderBottom: 'none' },
                                }}
                            >
                                {columnHeaders.map((col, ci) => (
                                    <TableCell
                                        key={col.label}
                                        sx={{
                                            py: 1.25,
                                            px: 2,
                                            '&:first-of-type': { pl: 2.5 },
                                            '&:last-of-type': { pr: 2.5 },
                                            fontSize: '0.825rem',
                                            maxWidth: col.label === 'email' ? 200 : col.label === 'name' ? 220 : 'none',
                                            minWidth: col.isAction ? 110 : 'auto',
                                            borderRight: ci < columnHeaders.length - 1 ? `1px solid ${BORDER}` : 'none',
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

            {/* ── Pagination ─────────────────────────────────────────────────── */}
            <Box sx={{
                borderTop: `1px solid ${BORDER}`,
                bgcolor: HEADER_BG,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
            }}>
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
                            fontSize: '0.8rem', color: '#64748B', margin: 0,
                        },
                        '& .MuiTablePagination-select': { fontSize: '0.8rem' },
                        '& .MuiIconButton-root': {
                            borderRadius: '8px',
                            width: 32, height: 32,
                            '&:hover': { bgcolor: PRIMARY_8, color: PRIMARY },
                            '&.Mui-disabled': { opacity: 0.35 },
                            transition: 'all 0.15s',
                        },
                    }}
                />
            </Box>
        </Card>
    );
};

export default TableComponent;
