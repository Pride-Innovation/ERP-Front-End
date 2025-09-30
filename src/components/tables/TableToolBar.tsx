/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    GridToolbarContainer,
} from '@mui/x-data-grid';
import ButtonComponent from '../forms/Button';
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
    styled
} from '@mui/material';
import { TypographyComponent } from '../headers/TypographyComponent';
import { CustomToolbarWrapperProps, ITableToolBar } from './interface';
import FileUploadButton from '../forms/FileUploadButton';
import CustomGridToolbarExport from './CustomGridToolbarExport';
import { useContext, useEffect, useState } from 'react';
import { FileContext } from '../../context/file/FileContext';
import TableUtills from './utills';
import DateRangePicker from '../forms/DateRangePicker';
import dayjs, { Dayjs } from 'dayjs';
import { FormContext } from '../../context/form';

const StyledFormControl = styled(FormControl)(({ theme }) => ({
    minWidth: 160,
    '& .MuiInputBase-root': {
        borderRadius: 4,
        backgroundColor: alpha('#fff', 0.9),
        transition: 'all 0.2s ease',
        '&:hover': {
            backgroundColor: '#fff',
            boxShadow: `0 1px 4px ${alpha('#000', 0.07)}`
        }
    },
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: alpha('#000', 0.12),
    },
    '& .MuiSelect-select': {
        paddingTop: 8,
        paddingBottom: 8,
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
        // Convert Dayjs to Date for context
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
        <GridToolbarContainer
            sx={{
                width: '100%',
                display: 'flex',
                p: '20px',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 0 }
            }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TypographyComponent
                    size='17px'
                    color="#BC892C"
                    weight={600}
                    sx={{
                        textTransform: "uppercase",
                        mr: 2
                    }}
                >
                    {header.plural}
                </TypographyComponent>

                {status && (
                    <StyledFormControl size="small">

                        <Select
                            labelId="status-filter-label"
                            value={statusFilter}
                            onChange={handleStatusChange}
                            sx={{
                                minHeight: 36,
                                '& .MuiSelect-select': {
                                    display: 'flex',
                                    alignItems: 'center'
                                }
                            }}
                        >
                            <MenuItem value="all">All Status</MenuItem>
                            {(filterStatuses || [])?.map(status => (<MenuItem value={status.value}>
                                <Box
                                    component="span"
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <Box
                                        component="span"
                                        sx={{
                                            display: 'inline-block',
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            bgcolor: status.color,
                                            mr: 1
                                        }}
                                    />
                                    {status.label}
                                </Box>
                            </MenuItem>))}
                        </Select>
                    </StyledFormControl>
                )}
                {dateRangePicker && (
                    <Box sx={{ ml: 2, flexGrow: 1, maxWidth: 550 }}>
                        <DateRangePicker
                            startDate={startDate}
                            endDate={endDate}
                            onStartDateChange={handleStartDateChange}
                            onEndDateChange={handleEndDateChange}
                            startPlaceholder="From"
                            endPlaceholder="To"
                            compact
                        />
                    </Box>
                )}
            </Box>

            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{
                    ml: { xs: 0, sm: 'auto' },
                    width: { xs: '100%', sm: 'auto' }
                }}
            >
                {searchAction &&
                    <TextField
                        size='small'
                        placeholder="Search"
                        variant='outlined'
                        InputProps={{
                            sx: {
                                borderRadius: 1,
                                backgroundColor: alpha('#fff', 0.9),
                                '&:hover': {
                                    backgroundColor: '#fff',
                                    boxShadow: `0 1px 4px ${alpha('#000', 0.07)}`
                                },
                                minHeight: 36
                            }
                        }}
                    />
                }

                {refresh &&
                    <Box>
                        <ButtonComponent
                            handleClick={() => window.location.reload()}
                            sendingRequest={false}
                            buttonText="Refresh"
                            variant='outlined'
                            buttonColor='primary'
                            type='button'
                        />
                    </Box>
                }

                {createAction &&
                    <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
                        <ButtonComponent
                            handleClick={() => onCreationHandler()}
                            sendingRequest={false}
                            buttonText={`Create ${header.singular} `}
                            variant='contained'
                            buttonColor='success'
                            type='button'
                        />
                    </Box>
                }

                {importData &&
                    <Box>
                        <FileUploadButton title={header.plural} module={module} />
                    </Box>
                }

                {exportData && <CustomGridToolbarExport module={module} />}
            </Stack>
        </GridToolbarContainer>
    )
}

const CustomToolbarWrapper: React.FC<CustomToolbarWrapperProps> = ({
    createAction,
    importData,
    exportData,
    searchAction,
    header,
    onCreationHandler,
    module,
    refresh,
    status = false,
    onStatusChange,
    selectedStatus,
    dateRangePicker,
    ...props
}) => {
    return (
        <TableToolBar
            dateRangePicker={dateRangePicker}
            createAction={createAction}
            importData={importData}
            exportData={exportData}
            header={header}
            searchAction={searchAction}
            onCreationHandler={onCreationHandler}
            module={module}
            status={status}
            onStatusChange={onStatusChange}
            {...props}
            refresh={refresh}
            selectedStatus={selectedStatus}
        />
    );
};

export default CustomToolbarWrapper;