/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ChangeEvent, useEffect, useState } from 'react'
import { IDepartment } from './interface';
import { crudStates } from '../../../utils/constants';
import { Box, Card, Grid, InputAdornment, TextField, useMediaQuery, useTheme } from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ButtonComponent from '../../../components/forms/Button';
import DepartmentUtills from './utills';
import ModalComponent from '../../../components/modal';
import CreateDepartment from './CreateDepartment';
import UpdateDepartment from './UpdateDepartment';
import DeleteDepartment from './DeleteDepartment';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import Loading from '../../../components/loading';
import NoContent from '../../../components/noContent';
import DepartmentDetails from './DepartmentDetails';
import SettingsHeader from '../../../components/settingsNavigationCard';

const Departments = () => {
    const { setModalState, handleClose, handleOpen, modalState, open, fetchAllDepartments, loading } = DepartmentUtills();
    const [currentDepartment, setCurrentDepartment] = useState<IDepartment>({} as IDepartment);
    const [sendingRequest, setSendingRequest] = useState<boolean>(false)

    const { departments } = useSelector((state: RootState) => state.DepartmentStore)

    useEffect(() => { fetchAllDepartments() }, [])

    const createDepartment = () => {
        setModalState(crudStates.create);
        handleOpen()
    }

    const updateDepartment = (department: IDepartment) => {
        setCurrentDepartment(department)
        setModalState(crudStates.update);
        handleOpen()
    }

    const deleteDepartment = (department: IDepartment) => {
        setCurrentDepartment(department)
        setModalState(crudStates.delete);
        handleOpen()
    }

    return (
        <>
            {
                crudStates.create === modalState && <ModalComponent width={"50%"} title='Create Department' open={open} handleClose={handleClose}>
                    <CreateDepartment handleClose={handleClose} sendingRequest={sendingRequest} setSendingRequest={setSendingRequest} />
                </ModalComponent>
            }
            {
                crudStates.delete === modalState && <ModalComponent width={"35%"} title='Delete Department' open={open} handleClose={handleClose}>
                    <DeleteDepartment
                        department={currentDepartment}
                        handleClose={handleClose}
                        sendingRequest={sendingRequest}
                        setSendingRequest={setSendingRequest}
                        buttonText='Delete'
                    />
                </ModalComponent>
            }
            {
                crudStates.update === modalState && <ModalComponent width={"50%"} title='Update Department' open={open} handleClose={handleClose}>
                    <UpdateDepartment
                        handleClose={handleClose}
                        sendingRequest={sendingRequest}
                        setSendingRequest={setSendingRequest}
                        department={currentDepartment}
                    />
                </ModalComponent>
            }
            <SettingsHeader handleCreationClicked={createDepartment} title='Department'/>
            <Box>
                {loading ? (
                    <Loading items="departments" />
                ) : departments.length > 0 ? (
                    <Grid container spacing={3}>
                        {departments.map((department) => (
                            <Grid item xs={12} sm={6} md={4} key={department.id}>
                                <DepartmentDetails department={department} deleteDepartment={deleteDepartment} updateDepartment={updateDepartment} />
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <NoContent item="department" items="departments" />
                )}
            </Box>
        </>
    )
}

export default Departments