/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState } from "react";
import { IUnit } from "./interface";
import UnitUtills from "./utills";
import { crudStates } from "../../../utils/constants";
import { Box } from "@mui/material";
import ButtonComponent from "../../../components/forms/Button";
import UnitDetails from "./UnitDetails";
import ModalComponent from "../../../components/modal";
import CreateUnit from "./CreateUnit";
import UpdateUnit from "./UpdateUnit";
import DeleteUnit from "./DeleteUnit";

const Units = () => {
  const { units, setModalState, handleClose, handleOpen, modalState, open } = UnitUtills();
  const [currentUnit, setCurrentUnit] = useState<IUnit>({} as IUnit);
  const [sendingRequest, setSendingRequest] = useState<boolean>(false)

  const createUnit = () => {
    setModalState(crudStates.create);
    handleOpen()
  }

  const updateUnit = (unit: IUnit) => {
    setCurrentUnit(unit)
    setModalState(crudStates.update);
    handleOpen()
  }

  const deleteUnit = (unit: IUnit) => {
    setCurrentUnit(unit)
    setModalState(crudStates.delete);
    handleOpen()
  }

  return (
    <>
      {
        crudStates.create === modalState && <ModalComponent width={"50%"} title='Create Unit' open={open} handleClose={handleClose}>
          <CreateUnit handleClose={handleClose} sendingRequest={sendingRequest} setSendingRequest={setSendingRequest} />
        </ModalComponent>
      }
      {
        crudStates.delete === modalState && <ModalComponent width={"35%"} title='Delete Unit' open={open} handleClose={handleClose}>
          <DeleteUnit
            unit={currentUnit}
            handleClose={handleClose}
            sendingRequest={sendingRequest}
            setSendingRequest={setSendingRequest}
            buttonText='Delete'
          />
        </ModalComponent>
      }
      {
        crudStates.update === modalState && <ModalComponent width={"50%"} title='Update Unit' open={open} handleClose={handleClose}>
          <UpdateUnit
            handleClose={handleClose}
            sendingRequest={sendingRequest}
            setSendingRequest={setSendingRequest}
            unit={currentUnit}
          />
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
              handleClick={createUnit}
              sendingRequest={false}
              buttonText="Create New Unit"
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
            units.map(unit => (
              <UnitDetails
                unit={unit}
                deleteUnit={deleteUnit}
                updateUnit={updateUnit}
              />
            ))
          }
        </Box>
      </Box>
    </>
  )
}

export default Units