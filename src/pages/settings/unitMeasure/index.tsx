import { Box } from "@mui/material";
import ButtonComponent from "../../../components/forms/Button";
import UnitMeasureUtills from "./Utills";
import UnitMeasureDetails from "./UnitMeasureDetails";
import { IUnitOfMeasure } from "../../assets/ITEquipment/interface";
import { useState } from "react";
import { crudStates } from "../../../utils/constants";
import ModalComponent from "../../../components/modal";
import CreateUnitOfMeasure from "./CreateUnitOfMeasure";
import UpdateUnitOfMeasure from "./UpdateUnitOfMeasure";

const UnitMeasures = () => {
    const { unitsOfMeasure, setModalState, handleClose, handleOpen, modalState, open } = UnitMeasureUtills();
    const [currentUnitOfMeasure, setCurrentUnitOfMeasure] = useState<IUnitOfMeasure>({} as IUnitOfMeasure);


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
                    <CreateUnitOfMeasure handleClose={handleClose} sendingRequest={false} />
                </ModalComponent>
            }
            {
                crudStates.delete === modalState && <ModalComponent width={"35%"} title='Delete Unit of Measure' open={open} handleClose={handleClose}>
                    {/* <DeleteBranch branch={currentBranch} handleClose={handleClose} sendingRequest={false} buttonText='Delete' /> */}
                    <p>Delete Measure</p>
                </ModalComponent>
            }
            {
                crudStates.update === modalState && <ModalComponent width={"50%"} title='Update Unit of Measure' open={open} handleClose={handleClose}>
                    <UpdateUnitOfMeasure handleClose={handleClose} sendingRequest={false} unitOfMeasure={currentUnitOfMeasure} />
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