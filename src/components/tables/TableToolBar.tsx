import {
    GridToolbarContainer,
} from '@mui/x-data-grid';
import {
    alpha,
    Box,
    Stack,
    TextField,
    useTheme,
    FormControl,
    Select,
    MenuItem,
    SelectChangeEvent,
    styled,
    InputAdornment,
    Chip,
    Button,
    Divider
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
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';

const PRIMARY_COLOR = '#08796C';

const StyledFormControl = styled(FormControl)(({ theme }) => ({
    minWidth: 180,
    '& .MuiInputBase-root': {
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        transition: 'all 0.2s ease',
        border: `1px solid ${alpha('#000', 0.12)}`,
        '&:hover': {
            backgroundColor: '#FFFFFF',
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`
        },
        '&.Mui-focused': {
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}`
        }
    },
    '& .MuiOutlinedInput-notchedOutline': {
        border: 'none',
    },
    '& .MuiSelect-select': {
        paddingTop: 10,
        paddingBottom: 10,
        fontSize: '0.875rem',
        fontWeight: 500,
    }
}));

const StyledToolbarContainer = styled(GridToolbarContainer)(({ theme }) => ({
    width: '100%',
    display: 'flex',
    padding: '20px 24px',
    backgroundColor: '#F8FAFB',
    borderBottom: `1px solid ${alpha('#000', 0.08)}`,
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 12,
    }
}));

const TableToolBar = ({
    header,
    onCreationHandler,
    module,
    importData,
    exportData,
    createAction,
    searchAction,
    refresh,
    status = false,
    onStatusChange,
    selectedStatus = 'all',
    dateRangePicker = false
}: ITableToolBar) => {
    const { setFileName } = useContext(FileContext);
    const [statusFilter, setStatusFilter] = useState<string>(selectedStatus);
    useEffect(() => { setFileName(module) }, [module]);
    const theme = useTheme();
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
        if (date) {
            setTableStartDate(date.toDate());
        } else {
            setTableStartDate(null);
        }
    };

    const handleEndDateChange = (date: Dayjs | null) => {
        setEndDate(date);
        if (date) {
            setTableEndDate(date.toDate());
        } else {
            setTableEndDate(null);
        }
    };

    useEffect(() => {
        if (tableStartDate && !startDate) {
            setStartDate(dayjs(tableStartDate));
        }
        if (tableEndDate && !endDate) {
            setEndDate(dayjs(tableEndDate));
        }
    }, []);

    return (
        <StyledToolbarContainer>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap',
                flex: 1
            }}>
                {status && (
                    <StyledFormControl size="small">
                        <Select
                            labelId="status-filter-label"
                            value={statusFilter}
                            onChange={handleStatusChange}
                            startAdornment={
                                <InputAdornment position="start">
                                    <FilterListIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                                </InputAdornment>
                            }
                            sx={{
                                minHeight: 40,
                                '& .MuiSelect-select': {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }
                            }}
                        >
                            <MenuItem value="all">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip
                                        label="All Status"
                                        size="small"
                                        sx={{
                                            height: 24,
                                            fontSize: '0.75rem',
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            color: theme.palette.primary.main
                                        }}
                                    />
                                </Box>
                            </MenuItem>
                            {(filterStatuses || [])?.map(status => (
                                <MenuItem key={status.value} value={status.value}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box
                                            component="span"
                                            sx={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                bgcolor: status.color,
                                                flexShrink: 0
                                            }}
                                        />
                                        <Chip
                                            label={status.label}
                                            size="small"
                                            sx={{
                                                height: 24,
                                                fontSize: '0.75rem',
                                                bgcolor: alpha(status.color, 0.1),
                                                color: status.color,
                                                fontWeight: 500
                                            }}
                                        />
                                    </Box>
                                </MenuItem>
                            ))}
                        </Select>
                    </StyledFormControl>
                )}

                {dateRangePicker && (
                    <DateRangePicker
                        startDate={startDate}
                        endDate={endDate}
                        onStartDateChange={handleStartDateChange}
                        onEndDateChange={handleEndDateChange}
                        startPlaceholder="From"
                        endPlaceholder="To"
                        compact
                    />
                )}
            </Box>

            <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ flexShrink: 0 }}
            >
                {searchAction && (
                    <TextField
                        size='small'
                        placeholder="Search..."
                        variant='outlined'
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ fontSize: 17, color: 'text.disabled' }} />
                                </InputAdornment>
                            ),
                            sx: {
                                borderRadius: '8px',
                                backgroundColor: '#FFFFFF',
                                border: `1px solid ${alpha('#000', 0.12)}`,
                                height: 40,
                                fontSize: '0.875rem',
                                '&:hover': {
                                    borderColor: PRIMARY_COLOR,
                                    boxShadow: `0 0 0 2px ${alpha(PRIMARY_COLOR, 0.1)}`,
                                },
                                '&.Mui-focused': {
                                    borderColor: PRIMARY_COLOR,
                                    boxShadow: `0 0 0 3px ${alpha(PRIMARY_COLOR, 0.12)}`,
                                },
                                '& .MuiOutlinedInput-notchedOutline': {
                                    border: 'none',
                                },
                            }
                        }}
                        sx={{ width: 220 }}
                    />
                )}

                {(searchAction && (refresh || createAction || importData || exportData)) && (
                    <Divider orientation="vertical" flexItem sx={{ height: 24, alignSelf: 'center', mx: 0.5 }} />
                )}

                {refresh && (
                    <Button
                        onClick={() => window.location.reload()}
                        variant='outlined'
                        startIcon={<RefreshIcon sx={{ fontSize: '17px !important' }} />}
                        sx={{
                            height: 40,
                            px: 2,
                            borderRadius: '8px',
                            borderColor: alpha('#000', 0.18),
                            color: 'text.secondary',
                            textTransform: 'none',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            '&:hover': {
                                borderColor: PRIMARY_COLOR,
                                color: PRIMARY_COLOR,
                                backgroundColor: alpha(PRIMARY_COLOR, 0.05),
                            },
                            transition: 'all 0.2s ease',
                        }}
                    >
                        Refresh
                    </Button>
                )}

                {createAction && (
                    <Button
                        onClick={() => onCreationHandler()}
                        variant='contained'
                        startIcon={<AddIcon sx={{ fontSize: '17px !important' }} />}
                        sx={{
                            height: 40,
                            px: 2.5,
                            borderRadius: '8px',
                            bgcolor: PRIMARY_COLOR,
                            color: '#fff',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            boxShadow: `0 2px 8px ${alpha(PRIMARY_COLOR, 0.35)}`,
                            '&:hover': {
                                bgcolor: '#065f54',
                                boxShadow: `0 4px 14px ${alpha(PRIMARY_COLOR, 0.4)}`,
                                transform: 'translateY(-1px)',
                            },
                            '&:active': {
                                transform: 'translateY(0)',
                                boxShadow: `0 2px 8px ${alpha(PRIMARY_COLOR, 0.35)}`,
                            },
                            transition: 'all 0.2s ease',
                        }}
                    >
                        Create
                    </Button>
                )}

                {importData && (
                    <FileUploadButton title={header.plural} module={module} />
                )}

                {exportData && <CustomGridToolbarExport module={module} />}
            </Stack>
        </StyledToolbarContainer>
    );
};

const CustomToolbarWrapper: React.FC<CustomToolbarWrapperProps> = (props) => {
    return <TableToolBar {...props} />;
};

export default CustomToolbarWrapper;