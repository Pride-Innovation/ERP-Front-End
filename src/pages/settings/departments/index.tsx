/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Typography,
    Button,
    Stack,
    alpha,
    useTheme,
    Paper,
    InputAdornment,
    TextField,
    Fade,
    Pagination,
    Chip
} from "@mui/material";
import { useEffect, useState } from 'react';
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';

import { IDepartment } from './interface';
import { crudStates } from '../../../utils/constants';
import DepartmentUtills from './utills';
import ModalComponent from '../../../components/modal';
import CreateDepartment from './CreateDepartment';
import UpdateDepartment from './UpdateDepartment';
import DeleteDepartment from './DeleteDepartment';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import Loading from '../../../components/loading';
import DepartmentDetails from './DepartmentDetails';
import { useDebounce } from '../../../hooks/useDebounce';
import { RequirePermission } from '../../../core/permissions';
import { PERMISSIONS } from '../../../core/permissions/constants';
import { PageHero } from '../../../components/layout';

const PRIMARY = '#08796C';

const Departments = () => {
    const { setModalState, handleClose, handleOpen, modalState, open, fetchAllDepartments, loading } = DepartmentUtills();
    const [currentDepartment, setCurrentDepartment] = useState<IDepartment>({} as IDepartment);
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [pageNumber, setPageNumber] = useState<number>(0);
    const pageSize = 9;
    const theme = useTheme();

    const debouncedSearch = useDebounce<string>(searchTerm, 500);
    const { departments, totalPages, totalElements } = useSelector((state: RootState) => state.DepartmentStore);

    useEffect(() => {
        fetchAllDepartments({ pageNumber, pageSize, name: debouncedSearch || undefined });
    }, [pageNumber, debouncedSearch]);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setPageNumber(0);
    };

    const hasActiveFilters = searchTerm !== '';

    const clearFilters = () => {
        setSearchTerm('');
        setPageNumber(0);
    };

    const createDepartment = () => {
        setModalState(crudStates.create);
        handleOpen();
    };

    const updateDepartment = (department: IDepartment) => {
        setCurrentDepartment(department);
        setModalState(crudStates.update);
        handleOpen();
    };

    const deleteDepartment = (department: IDepartment) => {
        setCurrentDepartment(department);
        setModalState(crudStates.delete);
        handleOpen();
    };

    return (
        <>
            {/* Modals */}
            {modalState === crudStates.create && (
                <ModalComponent width="60%" title="Create Department" open={open} handleClose={handleClose}>
                    <CreateDepartment
                        handleClose={handleClose}
                        sendingRequest={sendingRequest}
                        setSendingRequest={setSendingRequest}
                    />
                </ModalComponent>
            )}
            {modalState === crudStates.update && (
                <ModalComponent width="60%" title="Update Department" open={open} handleClose={handleClose}>
                    <UpdateDepartment
                        handleClose={handleClose}
                        sendingRequest={sendingRequest}
                        setSendingRequest={setSendingRequest}
                        department={currentDepartment}
                    />
                </ModalComponent>
            )}
            {modalState === crudStates.delete && (
                <ModalComponent width="40%" title="Delete Department" open={open} handleClose={handleClose}>
                    <DeleteDepartment
                        department={currentDepartment}
                        handleClose={handleClose}
                        sendingRequest={sendingRequest}
                        setSendingRequest={setSendingRequest}
                        buttonText="Delete"
                    />
                </ModalComponent>
            )}

            <PageHero
                title="Department Management"
                subtitle="Manage organizational departments, leadership, and team structures"
                icon={<AccountTreeOutlinedIcon />}
                stat={{ value: totalElements ?? 0, label: 'records' }}
                actions={
                    <RequirePermission permission={PERMISSIONS.CREATE_SETTING}>
                        <Button onClick={createDepartment} startIcon={<AddIcon />} variant="contained"
                            sx={{ height: 36, px: 2.5, borderRadius: '8px', textTransform: 'none', fontWeight: 600, bgcolor: PRIMARY, flexShrink: 0, '&:hover': { bgcolor: '#065E53' }, boxShadow: `0 2px 8px ${alpha(PRIMARY, 0.3)}` }}>
                            Add Department
                        </Button>
                    </RequirePermission>
                }
            />

            {/* Filter Bar */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between" sx={{ mb: 3 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                        size="small"
                        placeholder="Search departments..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: '#94A3B8' }} /></InputAdornment>) }}
                        sx={{ minWidth: 240, '& .MuiOutlinedInput-root': { borderRadius: '8px', height: 36, bgcolor: '#fff', '& fieldset': { borderColor: '#E2E8F0' }, '&:hover fieldset': { borderColor: PRIMARY }, '&.Mui-focused fieldset': { borderColor: PRIMARY, borderWidth: 1.5 } } }}
                    />
                    {hasActiveFilters && (
                        <Chip
                            label="Clear filters"
                            size="small"
                            icon={<FilterListOffIcon fontSize="small" />}
                            onClick={clearFilters}
                            onDelete={clearFilters}
                            sx={{ borderRadius: '6px', fontWeight: 500 }}
                        />
                    )}
                </Stack>
            </Stack>

            {/* Department Cards */}
            <Box sx={{ position: 'relative', minHeight: '200px' }}>
                {loading ? (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 4,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.background.paper, 0.5),
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                        }}
                    >
                        <Loading items="departments" />
                    </Paper>
                ) : departments.length > 0 ? (
                    <Fade in={!loading}>
                        <Box className="department-grid">
                            {departments.map((department) => (
                                <DepartmentDetails
                                    key={department.id}
                                    department={department}
                                    deleteDepartment={deleteDepartment}
                                    updateDepartment={updateDepartment}
                                />
                            ))}
                        </Box>
                    </Fade>
                ) : (
                    <Fade in={!loading}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 6,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center',
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.background.paper, 0.5),
                                border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`
                            }}
                        >
                            <AccountTreeOutlinedIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.3), mb: 2 }} />

                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                {hasActiveFilters ? "No matching departments found" : "No departments available"}
                            </Typography>

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 450 }}>
                                {hasActiveFilters
                                    ? "Try adjusting your search criteria to find what you're looking for."
                                    : "Get started by adding your first department to organize your workforce structure."
                                }
                            </Typography>

                            {hasActiveFilters ? (
                                <Button
                                    variant="outlined"
                                    onClick={clearFilters}
                                    sx={{ textTransform: 'none', borderRadius: 1.5 }}
                                >
                                    Clear Search
                                </Button>
                            ) : (
                                <RequirePermission permission={PERMISSIONS.CREATE_SETTING}>
                                    <Button
                                        variant="contained"
                                        onClick={createDepartment}
                                        startIcon={<AddIcon />}
                                        sx={{
                                            textTransform: 'none',
                                            borderRadius: 1.5,
                                            px: 3
                                        }}
                                    >
                                        Add Department
                                    </Button>
                                </RequirePermission>
                            )}
                        </Paper>
                    </Fade>
                )}
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                        count={totalPages}
                        page={pageNumber + 1}
                        onChange={(_, value) => setPageNumber(value - 1)}
                        color="primary"
                        shape="rounded"
                    />
                </Box>
            )}
        </>
    );
};

export default Departments;