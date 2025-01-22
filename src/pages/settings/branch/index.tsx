import { Box, Button, Card, Stack, TextField, Typography } from "@mui/material"
import BranchUtills from "./utills"
import { grey } from "@mui/material/colors"
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CameraOutdoorOutlinedIcon from '@mui/icons-material/CameraOutdoorOutlined';
import ButtonComponent from "../../../components/forms/Button";
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { ChangeEvent } from "react";
import { crudStates } from "../../../utils/constants";
import ModalComponent from "../../../components/modal";
import CreateBranch from "./CreateBranch";

const Branches = () => {
  const { branches, filterByName, modalState, open, handleClose } = BranchUtills()

  return (
    <>
      {
        crudStates.create === modalState && <ModalComponent width={"35%"} title='Create Role' open={open} handleClose={handleClose}>
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
              handleClick={() => console.log("create branch")}
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
              <Card sx={{
                boxShadow: 0,
                p: 2,
                border: `2px solid ${grey[200]}`,
              }}>
                <Box
                  sx={{ width: "100%", alignItems: "center" }}
                  py={1.5}
                >
                  <Typography noWrap variant="body2" sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <CameraOutdoorOutlinedIcon fontSize="small" color="info" sx={{ mr: "4px" }} />
                    {branch.name}
                  </Typography>
                </Box>
                <Stack
                  direction="column"
                  spacing={2}
                  sx={{
                    pt: 3,
                    borderTop: `2px solid ${grey[200]}`,
                    alignItems: "center",
                    height: "100%"
                  }} >
                  <Typography variant="body2" sx={{ fontWeight: 600, textAlign: "center" }}>
                    Contact
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 400, textAlign: "center" }}>
                    {branch.email}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 400, textAlign: "center" }}>
                    {/* {branch.tel} */}
                    +256777338787
                  </Typography>
                  <Button
                    onClick={() => console.log(branch.id)}
                    sx={{ textTransform: "none" }} startIcon={<EditOutlinedIcon />} variant="contained" color="info">Update</Button>
                  <Button
                    onClick={() => console.log(branch.id)}
                    sx={{ textTransform: "none" }} startIcon={<DeleteOutlineOutlinedIcon />} variant="outlined" color="error">Delete</Button>
                </Stack>
              </Card >
            ))
          }
        </Box>
      </Box>
    </>
  )
}

export default Branches