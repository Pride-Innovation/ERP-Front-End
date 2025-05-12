/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
  Box,
  Card,
  CircularProgress,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import FolderOffOutlinedIcon from '@mui/icons-material/FolderOffOutlined';
import ButtonComponent from "../../../components/forms/Button";
import ModalComponent from "../../../components/modal";
import CreateBranch from "./CreateBranch";
import ViewBranch from "./ViewBranch";
import UpdateBranch from "./UpdateBranch";
import DeleteBranch from "./DeleteBranch";
import { IBranch } from "./interface";
import BranchUtills from "./utills";
import { useEffect, useState, ChangeEvent } from "react";
import { crudStates } from "../../../utils/constants";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";

const Branches = () => {
  const [currentBranch, setCurrentBranch] = useState<IBranch>({} as IBranch);
  const [sendingRequest, setSendingRequest] = useState<boolean>(false);
  const { branches } = useSelector((state: RootState) => state.BranchStore);
  const {
    filterByName,
    modalState,
    open,
    handleClose,
    handleOpen,
    setModalState,
    loading,
    fetchAllBranches,
  } = BranchUtills();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchAllBranches();
  }, []);

  const createBranch = () => {
    setModalState(crudStates.create);
    handleOpen();
  };

  const updateBranch = (branch: IBranch) => {
    setCurrentBranch(branch);
    setModalState(crudStates.update);
    handleOpen();
  };

  const deleteBranch = (branch: IBranch) => {
    setCurrentBranch(branch);
    setModalState(crudStates.delete);
    handleOpen();
  };

  return (
    <>
      {modalState === crudStates.create && (
        <ModalComponent width="60%" title="Create Branch" open={open} handleClose={handleClose}>
          <CreateBranch
            handleClose={handleClose}
            sendingRequest={sendingRequest}
            setSendingRequest={setSendingRequest}
          />
        </ModalComponent>
      )}
      {modalState === crudStates.update && (
        <ModalComponent width="50%" title="Update Branch" open={open} handleClose={handleClose}>
          <UpdateBranch
            branch={currentBranch}
            handleClose={handleClose}
            setSendingRequest={setSendingRequest}
            sendingRequest={sendingRequest}
          />
        </ModalComponent>
      )}
      {modalState === crudStates.delete && (
        <ModalComponent width="35%" title="Delete Branch" open={open} handleClose={handleClose}>
          <DeleteBranch
            branch={currentBranch}
            handleClose={handleClose}
            setSendingRequest={setSendingRequest}
            sendingRequest={sendingRequest}
            buttonText="Delete"
          />
        </ModalComponent>
      )}

      <Card
        elevation={2}
        sx={{
          p: 3,
          mb: 4,
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <TextField
          placeholder="Filter by branch name"
          size="small"
          onChange={(e: ChangeEvent<HTMLInputElement>) => filterByName(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon color="info" />
              </InputAdornment>
            ),
          }}
          sx={{ width: isSmallScreen ? "100%" : "300px" }}
        />
        <ButtonComponent
          handleClick={createBranch}
          sendingRequest={false}
          buttonText="Create New Branch"
          variant="contained"
          buttonColor="info"
          type="button"
        />
      </Card>

      <Box>
        {loading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 300 }}>
            <CircularProgress color="info" />
            <Typography variant="body2" mt={2}>
              Loading branches...
            </Typography>
          </Stack>
        ) : branches.length > 0 ? (
          <Grid container spacing={3}>
            {branches.map((branch) => (
              <Grid item xs={12} sm={6} md={4} key={branch.id}>
                <ViewBranch branch={branch} deleteBranch={deleteBranch} updateBranch={updateBranch} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
            <FolderOffOutlinedIcon sx={{ fontSize: 60, color: "#835F1E" }} />
            <Typography variant="h6" sx={{ mt: 2, color: "text.secondary" }}>
              No branches available
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Create your first branch to get started.
            </Typography>
          </Stack>
        )}
      </Box>
    </>
  );
};

export default Branches;
