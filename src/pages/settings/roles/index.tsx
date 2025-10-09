/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Button, Typography, Stack, Divider, alpha, useTheme, Fade, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
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

const Roles = () => {
    const theme = useTheme();
    const {
        open,
        handleClose,
        handleOpen,
        modalState,
        setModalState,
        loading,
        count,
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
                {/* Page Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography
                        variant="h5"
                        fontWeight={600}
                        color="primary"
                        sx={{ mb: 1 }}
                    >
                        Role Management
                    </Typography>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Typography variant="body2" color="text.secondary">
                            {roles?.length || 0} roles found
                        </Typography>
                        <Button
                            onClick={createRole}
                            startIcon={<AddIcon />}
                            variant='contained'
                            color='primary'
                            sx={{
                                px: 3,
                                py: 1,
                                borderRadius: 1.5,
                                textTransform: 'none',
                                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                            }}
                        >
                            Create New Role
                        </Button>
                    </Stack>
                    <Divider sx={{ mt: 2, opacity: 0.6 }} />
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