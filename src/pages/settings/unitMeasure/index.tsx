import { Box } from "@mui/material";
import ButtonComponent from "../../../components/forms/Button";
import UnitMeasureUtills from "./Utills";
import UnitMeasureDetails from "./UnitMeasureDetails";
import { IUnitOfMeasure } from "../../assets/ITEquipment/interface";
import { useState } from "react";
import { crudStates } from "../../../utils/constants";

const UnitMeasures = () => {
    const { unitsOfMeasure, setModalState, handleClose, handleOpen } = UnitMeasureUtills();
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
                        handleClick={() => console.log("create unit of measure!!")}
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
    )
}

export default UnitMeasures;