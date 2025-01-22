import {
  Box,
  Button,
  Card,
  Stack,
  TextField,
  Typography
} from "@mui/material"
import BranchUtills from "./utills"
import ButtonComponent from "../../../components/forms/Button";
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { ChangeEvent } from "react";
import { crudStates } from "../../../utils/constants";
import ModalComponent from "../../../components/modal";
import CreateBranch from "./CreateBranch";
import ViewBranch from "./ViewBranch";

const Branches = () => {
  const { branches, filterByName, modalState, open, handleClose, handleOpen, setModalState } = BranchUtills()


  const createBranchFxn = () => {
    setModalState(crudStates.create);
    handleOpen()
  }

  return (
    <>
      {
        crudStates.create === modalState && <ModalComponent width={"50%"} title='Create Branch' open={open} handleClose={handleClose}>
          <CreateBranch handleClose={handleClose} sendingRequest={false} />
        </ModalComponent>
      }
      <Box sx={{ width: "80%" }}>
        <Box sx={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
          mb: 4,
          alignItems: "center",
        }}>
          <Box sx={{ mr: "10px" }}>
            <TextField
              onChange={(e: ChangeEvent<HTMLInputElement>) => filterByName(e.target.value)}
              size="small"
              placeholder="Filter by branch name"
              InputProps={
                {
                  startAdornment: (<SearchOutlinedIcon color="info" fontSize="small" sx={{ mr: "10px" }} />)
                }
              }
            />
          </Box>
          <Box>
            <ButtonComponent
              handleClick={createBranchFxn}
              sendingRequest={false}
              buttonText="Create New Branch"
              variant='contained'
              buttonColor='info'
              type='button' />
          </Box>
        </Box>
        <Box
          display="grid"
          gridTemplateColumns="repeat(3, 1fr)"
          gap={3}
          sx={{
            width: "100%",
            alignItems: "center",
          }}>
          {
            branches.map(branch => (
                <ViewBranch branch={branch} />
            ))
          }
        </Box>
      </Box>
    </>
  )
}

export default Branches