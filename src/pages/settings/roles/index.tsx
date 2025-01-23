import { Box } from '@mui/material';
import ButtonComponent from '../../../components/forms/Button';
import RoleDetails from './RoleDetails';
import { IRole } from '../interface';
import ModalComponent from '../../../components/modal';
import RoleUtills from './utills';
import { crudStates } from '../../../utils/constants';
import { useEffect, useState } from 'react';
import DeleteRole from './DeleteRole';
import CreateRole from './CreateRole';
import UpdateRole from './UpdateRole';


const Roles = () => {
    const { open, handleClose, handleOpen, modalState, setModalState, fetchAllRoles } = RoleUtills();
    const [currentRole, setCurrentRole] = useState<IRole>({} as IRole);
    const [roles, setRoles] = useState<IRole[]>([] as Array<IRole>)

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const rolesData = await fetchAllRoles();
                setRoles(rolesData);
            } catch (error) {
                console.error("Error fetching roles:", error);
            }
        };

        fetchRoles();
    }, []);
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
            {
                crudStates.create === modalState && <ModalComponent width={"35%"} title='Create Role' open={open} handleClose={handleClose}>
                    <CreateRole handleClose={handleClose} sendingRequest={false} />
                </ModalComponent>
            }
            {
                crudStates.delete === modalState && <ModalComponent width={"35%"} title='Delete Role' open={open} handleClose={handleClose}>
                    <DeleteRole role={currentRole} handleClose={handleClose} sendingRequest={false} buttonText='Delete' />
                </ModalComponent>
            }
            {
                crudStates.update === modalState && <ModalComponent width={"35%"} title='Update Role' open={open} handleClose={handleClose}>
                    <UpdateRole handleClose={handleClose} sendingRequest={false} role={currentRole} />
                </ModalComponent>
            }

            <Box sx={{ width: "100%" }}>
                <Box sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "flex-end",
                    mb: 4,
                    alignItems: "center",
                }}>
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
                        roles.map((role: IRole) => {
                            return (
                                <RoleDetails updateRole={updateRole} deleteRole={deleteRole} role={role} />
                            )
                        })
                    }
                </Box>
            </Box>
        </>
    )
}

export default Roles;