import { Box, Typography } from '@mui/material'
import ButtonComponent from '../../../components/forms/Button';
import RoleDetails from './RoleDetails';
import { rolesMock } from '../../../mocks/settings';
import { IRole } from '../interface';
import ModalComponent from '../../../components/modal';
import RoleUtills from './utills';
import { crudStates } from '../../../utils/constants';
import { useState } from 'react';
import DeleteRole from './DeleteRole';
import CreateRole from './CreateRole';

const Roles = () => {
    const { open, handleClose, handleOpen, modalState, setModalState } = RoleUtills();
    const [currentRole, setCurrentRole] = useState<IRole>({} as IRole);

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

    console.log(open, "modal state!!!!");
    
    return (
        <Box sx={{ py: 4 }}>
            <Box sx={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                mb: 4,
                alignItems: "center",
            }}>
                {
                    crudStates.create === modalState && <ModalComponent width={"40%"} title='Create Role' open={open} handleClose={handleClose}>
                        <CreateRole />
                    </ModalComponent>
                }
                {
                    crudStates.delete === modalState && <ModalComponent width={"40%"} title='Delete Role' open={open} handleClose={handleClose}>
                        <DeleteRole role={currentRole} handleClose={handleClose} sendingRequest={false} buttonText='Delete' />
                    </ModalComponent>
                }
                {
                    crudStates.update === modalState && <ModalComponent width={"40%"} title='Update Role' open={open} handleClose={handleClose}>
                        <p>Update Role</p>
                    </ModalComponent>
                }
                <Typography sx={{ fontWeight: 600, textTransform: "none", fontSize: '17px' }}>Accounts Settings</Typography>
                <Box>
                    <ButtonComponent
                        handleClick={createRole}
                        sendingRequest={false}
                        buttonText="Create New Role"
                        variant='contained'
                        buttonColor='info'
                        type='button' />
                </Box>
            </Box>
            <Box
                display="grid"
                sx={{ width: "100%" }}
                gridTemplateColumns="1fr"
                gap={4}
            >
                {
                    rolesMock.map((role: IRole) => {
                        return (
                            <RoleDetails updateRole={updateRole} deleteRole={deleteRole} role={role} />
                        )
                    })
                }
            </Box>

        </Box>
    )
}

export default Roles;