/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Button, Typography, Stack, alpha, useTheme, Fade, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
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
        fetchAllRoles
    } = RoleUtills();
    const [currentRole, setCurrentRole] = useState<IRole>({} as IRole);
    const { roles } = useSelector((state: RootState) => state.RoleStore);

    useEffect(() => { fetchAllRoles() }, []);

    const createRole = () => {
        setModalState(crudStates.create);
        handleOpen()
    }

    const deleteRole = (role: IRole) => {
        setCurrentRole(role)
        setModalState(crudStates.delete);
        handleOpen()
    }

    const updateRole = (role: IRole) => {
        setCurrentRole(role)
        setModalState(crudStates.update);
        handleOpen()
    }

    return (
        <>
            {/* Modals for CRUD operations */}
            {crudStates.create === modalState &&
                <ModalComponent
                    width={"35%"}
                    title='Create Role'
                    open={open}
                    handleClose={handleClose}
                >
                    <CreateRole handleClose={handleClose} sendingRequest={loading} />
                </ModalComponent>
            }
            {crudStates.delete === modalState &&
                <ModalComponent
                    width={"35%"}
                    title='Delete Role'
                    open={open}
                    handleClose={handleClose}
                >
                    <DeleteRole
                        role={currentRole}
                        handleClose={handleClose}
                        sendingRequest={loading}
                        buttonText='Delete'
                    />
                </ModalComponent>
            }
            {crudStates.update === modalState &&
                <ModalComponent
                    width={"35%"}
                    title='Update Role'
                    open={open}
                    handleClose={handleClose}
                >
                    <UpdateRole
                        handleClose={handleClose}
                        sendingRequest={loading}
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
                            {roles?.length || 0} roles
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

                {/* Role list */}
                <Box sx={{ position: 'relative', minHeight: '200px' }}>
                    {loading ? (
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '200px'
                            }}
                        >
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
                                        />
                                    ))
                                ) : (
                                    <Box
                                        sx={{
                                            textAlign: 'center',
                                            py: 6,
                                            bgcolor: alpha(theme.palette.background.paper, 0.5),
                                            borderRadius: 2,
                                            border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`
                                        }}
                                    >
                                        <Typography color="text.secondary">
                                            No roles found. Create a new role to get started.
                                        </Typography>
                                        <Button
                                            onClick={createRole}
                                            variant="outlined"
                                            color="primary"
                                            sx={{ mt: 2, textTransform: 'none' }}
                                        >
                                            Create Role
                                        </Button>
                                    </Box>
                                )}
                            </Stack>
                        </Fade>
                    )}
                </Box>
            </Box>
        </>
    )
}

export default Roles;