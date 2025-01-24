import {
  Box,
  TextField,
} from "@mui/material"
import BranchUtills from "./Utills"
import ButtonComponent from "../../../components/forms/Button";
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { ChangeEvent, useState } from "react";
import { crudStates } from "../../../utils/constants";
import ModalComponent from "../../../components/modal";
import CreateBranch from "./CreateBranch";
import ViewBranch from "./ViewBranch";
import UpdateBranch from "./UpdateBranch";
import DeleteBranch from "./DeleteBranch";
import { IBranch } from "./interface";

const Branches = () => {
  const [currentBranch, setCurrentBranch] = useState<IBranch>({} as IBranch);
  const [sendingRequest, setSendingRequest] = useState<boolean>(false)

  const { branches, filterByName, modalState, open, handleClose, handleOpen, setModalState } = BranchUtills()


  const createBranch = () => {
    setModalState(crudStates.create);
    handleOpen()
  }

  const updateBranch = (branch: IBranch) => {
    setCurrentBranch(branch)
    setModalState(crudStates.update);
    handleOpen()
  }

  const deleteBranch = (branch: IBranch) => {
    setCurrentBranch(branch)
    setModalState(crudStates.delete);
    handleOpen()
  }

  return (
    <>
      {
        crudStates.create === modalState && <ModalComponent width={"50%"} title='Create Branch' open={open} handleClose={handleClose}>
          <CreateBranch handleClose={handleClose} sendingRequest={sendingRequest} setSendingRequest={setSendingRequest} />
        </ModalComponent>
      }
      {
        crudStates.delete === modalState && <ModalComponent width={"35%"} title='Delete Branch' open={open} handleClose={handleClose}>
          <DeleteBranch
            branch={currentBranch}
            handleClose={handleClose}
            setSendingRequest={setSendingRequest}
            sendingRequest={sendingRequest}
            buttonText='Delete' />
        </ModalComponent>
      }
      {
        crudStates.update === modalState && <ModalComponent width={"50%"} title='Update Branch' open={open} handleClose={handleClose}>
          <UpdateBranch
            handleClose={handleClose}
            setSendingRequest={setSendingRequest}
            sendingRequest={sendingRequest}
            branch={currentBranch}
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
              handleClick={createBranch}
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
              <ViewBranch branch={branch} deleteBranch={deleteBranch} updateBranch={updateBranch} />
            ))
          }
        </Box>
      </Box>
    </>
  )
}

export default Branches