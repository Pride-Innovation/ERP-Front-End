/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Grid, Stack, Typography } from "@mui/material";
import { IDeleteUnit } from "./interface";
import ScaleIcon from '@mui/icons-material/Scale';
import ButtonComponent from "../../../components/forms/Button";
import UnitUtills from "./utills";
import { toast } from "react-toastify";
import { deleteUnitService } from "./service";

const DeleteUnit = ({
  handleClose,
  sendingRequest,
  setSendingRequest,
  buttonText,
  unit
}: IDeleteUnit) => {

  const { removeUnitFromStore } = UnitUtills();

  const deleteUnit = async () => {
    setSendingRequest(true)
    const response = await deleteUnitService(unit?.id as string);
    setSendingRequest(false)
    if (response?.status === "success") {
      removeUnitFromStore(unit)
      handleClose();
      toast.success(response?.data?.message)
    }
  }
  return (
    <Grid item container spacing={4} xs={12}>
      <Grid item xs={12}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Are you sure you want to delete this Unit?
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <ScaleIcon color="primary" />
          <Typography variant="h6" color="primary">
            {unit.name}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
          <Typography variant="subtitle1" color="textSecondary">
            Department Name: {unit.department?.name}
          </Typography>
        </Stack>
      </Grid>
      <Grid item xs={12} sx={{ display: "flex", justifyContent: "end" }}>
        <Stack direction="row" spacing={3} sx={{ width: "50%" }}>
          <ButtonComponent
            handleClick={handleClose}
            buttonColor='info'
            type='button'
            variant="outlined"
            sendingRequest={false}
            buttonText="Close"
          />
          <ButtonComponent
            handleClick={deleteUnit}
            buttonColor='error'
            type='submit'
            sendingRequest={sendingRequest}
            buttonText={buttonText}
          />
        </Stack>
      </Grid>
    </Grid>
  )
}

export default DeleteUnit;