import { Box } from "@mui/material";
import ButtonComponent from "../../../components/forms/Button";
import UnitMeasureUtills from "./Utills";
import UnitMeasureDetails from "./UnitMeasureDetails";
import { useState } from "react";
import { crudStates } from "../../../utils/constants";
import ModalComponent from "../../../components/modal";
import CreateUnitOfMeasure from "./CreateUnitOfMeasure";
import UpdateUnitOfMeasure from "./UpdateUnitOfMeasure";
import DeleteUnitOfMeasure from "./DeleteUnitOfMeasure";
import { IUnitOfMeasure } from "./interface";

const UnitMeasures = () => {
    const { unitsOfMeasure, setModalState, handleClose, handleOpen, modalState, open } = UnitMeasureUtills();
    const [currentUnitOfMeasure, setCurrentUnitOfMeasure] = useState<IUnitOfMeasure>({} as IUnitOfMeasure);
    const [sendingRequest, setSendingRequest] = useState<boolean>(false)

    const createUnitOfMeasure = () => {
        setModalState(crudStates.create);
        handleOpen()
    }

    const updateUnitOfMeasure = (unitOfMeasure: IUnitOfMeasure) => {
        setCurrentUnitOfMeasure(unitOfMeasure)
        setModalState(crudStates.update);
        handleOpen()
    }

    const deleteUnitOfMeasure = (unitOfMeasure: IUnitOfMeasure) => {
        setCurrentUnitOfMeasure(unitOfMeasure)
        setModalState(crudStates.delete);
        handleOpen()
    }

    return (
        <>
            {
                crudStates.create === modalState && <ModalComponent width={"50%"} title='Create Unit of Measure' open={open} handleClose={handleClose}>
                    <CreateUnitOfMeasure handleClose={handleClose} sendingRequest={sendingRequest} setSendingRequest={setSendingRequest} />
                </ModalComponent>
            }
            {
                crudStates.delete === modalState && <ModalComponent width={"35%"} title='Delete Unit of Measure' open={open} handleClose={handleClose}>
                    <DeleteUnitOfMeasure unitOfMeasure={currentUnitOfMeasure} handleClose={handleClose} sendingRequest={sendingRequest} buttonText='Delete' />
                </ModalComponent>
            }
            {
                crudStates.update === modalState && <ModalComponent width={"50%"} title='Update Unit of Measure' open={open} handleClose={handleClose}>
                    <UpdateUnitOfMeasure handleClose={handleClose} sendingRequest={sendingRequest} setSendingRequest={setSendingRequest} unitOfMeasure={currentUnitOfMeasure} />
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
                            handleClick={createUnitOfMeasure}
                            sendingRequest={false}
                            buttonText="Create New Unit of Measure"
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
                        unitsOfMeasure.map(measure => (
                            <UnitMeasureDetails
                                unitOfMeasure={measure}
                                deleteUnitOfMeasure={deleteUnitOfMeasure}
                                updateUnitOfMeasure={updateUnitOfMeasure}
                            />
                        ))
                    }
                </Box>
            </Box>
        </>
    )
}

export default UnitMeasures;