import { useState } from 'react'
import { IDepartment } from './interface';
import { crudStates } from '../../../utils/constants';
import { Box } from '@mui/material';
import ButtonComponent from '../../../components/forms/Button';
import DepartmentUtills from './utills';
import DepartmentDetails from './DepartmentDetails';

const Departments = () => {
    const { departments, setModalState, handleClose, handleOpen, modalState, open } = DepartmentUtills();
    const [currentDepartment, setCurrentDepartment] = useState<IDepartment>({} as IDepartment);
    const [sendingRequest, setSendingRequest] = useState<boolean>(false)

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

    console.log(departments, "departments!!!")
    return (
        <>
            {/* {
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
        } */}
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
                            handleClick={createDepartment}
                            sendingRequest={false}
                            buttonText="Create New Department"
                            variant='contained'
                            buttonColor='info'
                            type='button' />
                    </Box>
                </Box>
                <Box
                    display="grid"
                    gridTemplateColumns="repeat(4, 1fr)"
                    gap={3}
                    sx={{
                        width: "100%",
                        alignItems: "center",
                    }}>
                    {
                        departments.map(department => (
                            <DepartmentDetails
                                department={department}
                                deleteDepartment={deleteDepartment}
                                updateDepartment={updateDepartment}
                            />
                        ))
                    }
                </Box>
            </Box>
        </>
    )
}

export default Departments