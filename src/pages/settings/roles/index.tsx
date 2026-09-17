/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box, Button, Typography, Stack, alpha, useTheme, Fade,
    TextField, InputAdornment, Pagination, Chip, Paper
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
import { RequirePermission } from '../../../core/permissions';
import { PERMISSIONS } from '../../../core/permissions/constants';
import { PageHero } from '../../../components/layout';
import Loading from '../../../components/loading';

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

            <PageHero
                title="Role Management"
                subtitle="Define access roles and configure module-level permissions"
                icon={<ShieldOutlinedIcon />}
                stat={{ value: totalElements ?? 0, label: 'records' }}
                actions={
                    <RequirePermission permission={PERMISSIONS.CREATE_ROLE}>
                        <Button
                            onClick={createRole}
                            startIcon={<AddIcon />}
                            variant="contained"
                            sx={{
                                height: 36, px: 2.5, borderRadius: '8px',
                                textTransform: 'none', fontWeight: 600,
                                bgcolor: PRIMARY, flexShrink: 0,
                                '&:hover': { bgcolor: '#065E53' },
                                boxShadow: `0 2px 8px ${alpha(PRIMARY, 0.3)}`,
                            }}
                        >
                            Create Role
                        </Button>
                    </RequirePermission>
                }
            />

            {/* Filter Bar */}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                justifyContent="space-between"
                sx={{ mb: 3 }}
            >
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.5}
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                    sx={{ flex: 1 }}
                >
                    <TextField
                        size="small"
                        placeholder="Search roles..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" sx={{ color: '#94A3B8' }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            minWidth: 220,
                            flex: { xs: 1, md: 'unset' },
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px', height: 36, bgcolor: '#fff',
                                '& fieldset': { borderColor: '#E2E8F0' },
                                '&:hover fieldset': { borderColor: PRIMARY },
                                '&.Mui-focused fieldset': { borderColor: PRIMARY, borderWidth: 1.5 },
                            },
                        }}
                    />
                    {hasActiveFilters && (
                        <Chip
                            label="Clear filters"
                            size="small"
                            icon={<FilterListOffIcon fontSize="small" />}
                            onClick={clearFilters}
                            onDelete={clearFilters}
                            sx={{ height: 36, borderRadius: '8px', fontSize: '0.8rem', fontWeight: 500 }}
                        />
                    )}
                </Stack>
            </Stack>

            {/* Role Cards */}
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
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                        }}
                    >
                        <Loading items="roles" />
                    </Paper>
                ) : roles?.length ? (
                    <>
                        <Fade in={!loading}>
                            <Stack spacing={2.5}>
                                {roles.map((role: IRole) => (
                                    <RoleDetails
                                        key={role.id}
                                        updateRole={updateRole}
                                        deleteRole={deleteRole}
                                        role={role}
                                        allPermissions={allPermissions}
                                    />
                                ))}
                            </Stack>
                        </Fade>

                        {totalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                <Pagination
                                    count={totalPages}
                                    page={pageNumber + 1}
                                    onChange={(_, value) => setPageNumber(value - 1)}
                                    color="primary"
                                    shape="rounded"
                                    showFirstButton
                                    showLastButton
                                    sx={{
                                        '& .MuiPaginationItem-root': { borderRadius: '8px' },
                                        '& .Mui-selected': { bgcolor: `${PRIMARY} !important`, color: '#fff' },
                                    }}
                                />
                            </Box>
                        )}
                    </>
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
                                border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                            }}
                        >
                            <ShieldOutlinedIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.3), mb: 2 }} />

                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                {hasActiveFilters ? 'No matching roles found' : 'No roles available'}
                            </Typography>

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 450 }}>
                                {hasActiveFilters
                                    ? "Try adjusting your search criteria to find what you're looking for."
                                    : "Get started by creating your first role to define access levels in the system."
                                }
                            </Typography>

                            {hasActiveFilters ? (
                                <Button
                                    variant="outlined"
                                    onClick={clearFilters}
                                    sx={{ textTransform: 'none', borderRadius: 1.5 }}
                                >
                                    Clear Filters
                                </Button>
                            ) : (
                                <RequirePermission permission={PERMISSIONS.CREATE_ROLE}>
                                    <Button
                                        variant="contained"
                                        onClick={createRole}
                                        startIcon={<AddIcon />}
                                        sx={{ textTransform: 'none', borderRadius: 1.5, px: 3 }}
                                    >
                                        Create Role
                                    </Button>
                                </RequirePermission>
                            )}
                        </Paper>
                    </Fade>
                )}
            </Box>
        </>
    )
}

export default Roles;