/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box, Button, Typography, Stack, alpha, useTheme, Fade,
    CircularProgress, TextField, InputAdornment, Pagination, Chip, Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SearchIcon from '@mui/icons-material/Search';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import RoleDetails from './RoleDetails';
import { IRole } from '../interface';
import ModalComponent from '../../../components/modal';
import RoleUtills from './utills';
import { crudStates } from '../../../utils/constants';
import { useEffect, useState } from 'react';
import DeleteRole from './DeleteRole';
import CreateRole from './CreateRole';
import UpdateRole from './UpdateRole';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { useDebounce } from '../../../hooks/useDebounce';

const PRIMARY = '#08796C';

const Roles = () => {
    const theme = useTheme();
    const {
        open,
        handleClose,
        handleOpen,
        modalState,
        setModalState,
        loading,
        fetchAllRoles,
        fetchAllPermissions,
        allPermissions,
    } = RoleUtills();

    const [currentRole, setCurrentRole] = useState<IRole>({} as IRole);
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [pageNumber, setPageNumber] = useState<number>(0);
    const pageSize = 9;

    const debouncedSearch = useDebounce<string>(searchTerm, 500);
    const { roles, totalPages, totalElements } = useSelector((state: RootState) => state.RoleStore);

    useEffect(() => {
        fetchAllRoles({ pageNumber, pageSize, name: debouncedSearch || undefined });
    }, [pageNumber, debouncedSearch]);

    useEffect(() => {
        fetchAllPermissions();
    }, []);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setPageNumber(0);
    };

    const hasActiveFilters = searchTerm !== '';

    const clearFilters = () => {
        setSearchTerm('');
        setPageNumber(0);
    };

    const createRole = () => {
        setModalState(crudStates.create);
        handleOpen();
    };

    const deleteRole = (role: IRole) => {
        setCurrentRole(role);
        setModalState(crudStates.delete);
        handleOpen();
    };

    const updateRole = (role: IRole) => {
        setCurrentRole(role);
        setModalState(crudStates.update);
        handleOpen();
    };

    return (
        <>
            {/* Modals for CRUD operations */}
            {crudStates.create === modalState &&
                <ModalComponent width={"35%"} title='Create Role' open={open} handleClose={handleClose}>
                    <CreateRole handleClose={handleClose} sendingRequest={sendingRequest} setSendingRequest={setSendingRequest} />
                </ModalComponent>
            }
            {crudStates.delete === modalState &&
                <ModalComponent width={"35%"} title='Delete Role' open={open} handleClose={handleClose}>
                    <DeleteRole
                        role={currentRole}
                        handleClose={handleClose}
                        sendingRequest={sendingRequest}
                        setSendingRequest={setSendingRequest}
                        buttonText='Delete'
                    />
                </ModalComponent>
            }
            {crudStates.update === modalState &&
                <ModalComponent width={"35%"} title='Update Role' open={open} handleClose={handleClose}>
                    <UpdateRole
                        handleClose={handleClose}
                        sendingRequest={sendingRequest}
                        setSendingRequest={setSendingRequest}
                        role={currentRole}
                    />
                </ModalComponent>
            }

            <Box sx={{ width: "100%" }}>
                {/* Sub-page Header */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, pb: 2.5, borderBottom: '1px solid #E2E8F0' }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg, #08796C, #065E53)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <ShieldOutlinedIcon sx={{ color: '#fff', fontSize: 22 }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1E293B', lineHeight: 1.3 }}>Role Management</Typography>
                            <Typography variant="body2" sx={{ color: '#64748B' }}>Define access roles and configure module-level permissions</Typography>
                        </Box>
                    </Stack>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{ bgcolor: alpha(PRIMARY, 0.08), color: PRIMARY, fontWeight: 700, borderRadius: '6px', px: 1.5, py: 0.5, fontSize: '0.75rem' }}>
                            {totalElements} {totalElements === 1 ? 'role' : 'roles'}
                        </Box>
                        <Button
                            onClick={createRole}
                            startIcon={<AddIcon />}
                            variant="contained"
                            sx={{ height: 36, px: 2.5, borderRadius: '8px', textTransform: 'none', fontWeight: 600, bgcolor: PRIMARY, '&:hover': { bgcolor: '#065E53' }, boxShadow: `0 2px 8px ${alpha(PRIMARY, 0.3)}` }}
                        >
                            Create Role
                        </Button>
                    </Stack>
                </Box>

                {/* Filter bar */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
                        <TextField
                            size="small"
                            placeholder="Search roles..."
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

                {/* Role list */}
                <Box sx={{ position: 'relative', minHeight: '200px' }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                            <CircularProgress size={40} />
                        </Box>
                    ) : (
                        <Fade in={!loading}>
                            <Stack spacing={3}>
                                {roles?.length ? (
                                    roles.map((role: IRole) => (
                                        <RoleDetails
                                            key={role.id}
                                            updateRole={updateRole}
                                            deleteRole={deleteRole}
                                            role={role}
                                            allPermissions={allPermissions}
                                        />
                                    ))
                                ) : (
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 6,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            borderRadius: 2,
                                            bgcolor: alpha(theme.palette.background.paper, 0.5),
                                            border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`
                                        }}
                                    >
                                        <ShieldOutlinedIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.3), mb: 2 }} />
                                        <Typography variant="h6" color="text.secondary" gutterBottom>
                                            {hasActiveFilters ? 'No matching roles found' : 'No roles available'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
                                            {hasActiveFilters
                                                ? 'Try adjusting your search criteria.'
                                                : 'Create your first role to define access levels in the system.'
                                            }
                                        </Typography>
                                        {hasActiveFilters ? (
                                            <Button variant="outlined" onClick={clearFilters} sx={{ textTransform: 'none', borderRadius: 1.5 }}>
                                                Clear Search
                                            </Button>
                                        ) : (
                                            <Button onClick={createRole} variant="outlined" color="primary" sx={{ textTransform: 'none', borderRadius: 1.5 }}>
                                                Create Role
                                            </Button>
                                        )}
                                    </Paper>
                                )}
                            </Stack>
                        </Fade>
                    )}
                </Box>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination
                            count={totalPages}
                            page={pageNumber + 1}
                            onChange={(_, value) => setPageNumber(value - 1)}
                            color="primary"
                            shape="rounded"
                        />
                    </Box>
                )}
            </Box>
        </>
    )
}

export default Roles;