import {
    alpha,
    Box,
    Stack,
    TextField,
    FormControl,
    Select,
    MenuItem,
    SelectChangeEvent,
    InputAdornment,
    Button,
    Tooltip,
    IconButton,
    Typography,
    Grid,
    InputLabel,
} from '@mui/material';
import { CustomToolbarWrapperProps, ITableToolBar } from './interface';
import FileUploadButton from '../forms/FileUploadButton';
import CustomGridToolbarExport from './CustomGridToolbarExport';
import { useContext, useEffect, useState } from 'react';
import { FileContext } from '../../context/file/FileContext';
import TableUtills from './utills';
import DateRangePicker from '../forms/DateRangePicker';
import dayjs, { Dayjs } from 'dayjs';
import { FormContext } from '../../context/form';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';

const PRIMARY_COLOR = '#08796C';

const StyledToolbarContainer = Box;

const TableToolBar = ({
    header,
    onCreationHandler,
    module,
    importData,
    exportData,
    createAction,
    searchAction,
    onSearch,
    rows = [],
    refresh,
    status = false,
    onStatusChange,
    selectedStatus = 'all',
    dateRangePicker = false,
}: ITableToolBar) => {
    const { setFileName } = useContext(FileContext);
    const [statusFilter, setStatusFilter] = useState<string>(selectedStatus);
    useEffect(() => { setFileName(module) }, [module]);
    const { filterStatuses } = TableUtills({ moduleName: module });
    const { setTableStartDate, setTableEndDate, tableEndDate, tableStartDate } = useContext(FormContext);

    const handleStatusChange = (event: SelectChangeEvent) => {
        const newStatus = event.target.value;
        setStatusFilter(newStatus);
        onStatusChange?.(newStatus);
    };

    const [startDate, setStartDate] = useState<Dayjs | null>(null);
    const [endDate, setEndDate] = useState<Dayjs | null>(null);

    const handleStartDateChange = (date: Dayjs | null) => {
        setStartDate(date);
        if (date) { setTableStartDate(date.toDate()); } else { setTableStartDate(null); }
    };

    const handleEndDateChange = (date: Dayjs | null) => {
        setEndDate(date);
        if (date) { setTableEndDate(date.toDate()); } else { setTableEndDate(null); }
    };

    useEffect(() => {
        if (tableStartDate && !startDate) { setStartDate(dayjs(tableStartDate)); }
        if (tableEndDate && !endDate) { setEndDate(dayjs(tableEndDate)); }
    }, []);

    const hasFilters = status || dateRangePicker || searchAction;

    // Compute search column width based on other visible filters
    const searchMd = dateRangePicker && status ? 4 : (dateRangePicker || status) ? 6 : 9;

    return (
        <StyledToolbarContainer sx={{ width: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>

            {/* ── Top bar: title + action buttons ─────────────────────── */}
            <Box sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                px: 3, pt: 2.5, pb: hasFilters ? 1.5 : 2.5,
                flexWrap: 'wrap', gap: 1.5,
                borderBottom: hasFilters ? `1px solid #F1F5F9` : `1px solid #EEF2F7`,
            }}>
                {/* Left: table title */}
                <Stack direction="row" alignItems="center" gap={1.5}>
                    <Box sx={{
                        width: 36, height: 36, borderRadius: 1.5,
                        bgcolor: alpha(PRIMARY_COLOR, 0.08),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <FilterAltOutlinedIcon sx={{ fontSize: 18, color: PRIMARY_COLOR }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A', lineHeight: 1.2 }}>
                            {header?.plural}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                            Browse and manage records
                        </Typography>
                    </Box>
                </Stack>

                {/* Right: action buttons */}
                <Stack direction="row" gap={1} alignItems="center">
                    {refresh && (
                        <Tooltip title="Refresh" arrow>
                            <IconButton
                                onClick={() => window.location.reload()}
                                sx={{
                                    width: 38, height: 38, borderRadius: 1.5,
                                    border: `1px solid #E2E8F0`, color: '#64748B',
                                    '&:hover': { borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR, bgcolor: alpha(PRIMARY_COLOR, 0.04) },
                                    transition: 'all 0.2s',
                                }}
                            >
                                <RefreshOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    )}

                    {importData && <FileUploadButton title={header.plural} module={module} />}
                    {exportData && <CustomGridToolbarExport module={module} rows={rows} />}

                    {createAction && (
                        <Button
                            onClick={() => onCreationHandler()}
                            variant="contained"
                            startIcon={<AddOutlinedIcon sx={{ fontSize: '17px !important' }} />}
                            sx={{
                                height: 38, px: 2.5, borderRadius: "8px",
                                bgcolor: PRIMARY_COLOR, color: '#fff',
                                textTransform: 'none', fontWeight: 600, fontSize: '0.85rem',
                                boxShadow: `0 2px 8px ${alpha(PRIMARY_COLOR, 0.30)}`,
                                '&:hover': {
                                    bgcolor: '#065f54',
                                    boxShadow: `0 4px 14px ${alpha(PRIMARY_COLOR, 0.40)}`,
                                    transform: 'translateY(-1px)',
                                },
                                transition: 'all 0.2s',
                            }}
                        >
                            Add {header?.singular ?? 'Record'}
                        </Button>
                    )}
                </Stack>
            </Box>

            {/* ── Filter row ────────────────────────────────────────────── */}
            {hasFilters && (
                <Box sx={{ px: 3, py: 2, borderBottom: `1px solid #EEF2F7` }}>
                    <Grid container spacing={2} alignItems="center">

                        {/* Search */}
                        {searchAction && (
                            <Grid item xs={12} md={searchMd}>
                                <TextField
                                    fullWidth size="small"
                                    placeholder={`Search ${header?.plural ?? 'records'}…`}
                                    onChange={e => onSearch?.(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchOutlinedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                                />
                            </Grid>
                        )}

                        {/* Date range */}
                        {dateRangePicker && (
                            <Grid item xs={12} md={status ? (searchAction ? 4 : 6) : (searchAction ? 3 : 6)}>
                                <DateRangePicker
                                    startDate={startDate}
                                    endDate={endDate}
                                    onStartDateChange={handleStartDateChange}
                                    onEndDateChange={handleEndDateChange}
                                    startPlaceholder="From"
                                    endPlaceholder="To"
                                    compact
                                />
                            </Grid>
                        )}

                        {/* Status */}
                        {status && (
                            <Grid item xs={12} sm={6} md={searchAction || dateRangePicker ? 3 : 4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={statusFilter}
                                        label="Status"
                                        onChange={handleStatusChange}
                                        sx={{ borderRadius: "8px" }}
                                    >
                                        <MenuItem value="all">All Status</MenuItem>
                                        {(filterStatuses || []).map(s => (
                                            <MenuItem key={s.value} value={s.value}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box
                                                        component="span"
                                                        sx={{ width: 8, height: 8, borderRadius: "8px", bgcolor: s.color, flexShrink: 0 }}
                                                    />
                                                    {s.label}
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            )}
        </StyledToolbarContainer>
    );
};

const CustomToolbarWrapper: React.FC<CustomToolbarWrapperProps> = (props) => {
    return <TableToolBar {...props} />;
};

export default CustomToolbarWrapper;
