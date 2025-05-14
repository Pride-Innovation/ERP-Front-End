/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
  Box,
  Grid,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ModalComponent from "../../../components/modal";
import CreateBranch from "./CreateBranch";
import ViewBranch from "./ViewBranch";
import UpdateBranch from "./UpdateBranch";
import DeleteBranch from "./DeleteBranch";
import { IBranch } from "./interface";
import BranchUtills from "./utills";
import { useEffect, useState } from "react";
import { crudStates } from "../../../utils/constants";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import NoContent from "../../../components/noContent";
import Loading from "../../../components/loading";
import SettingsHeader from "../../../components/settingsNavigationCard";

const Branches = () => {
  const [currentBranch, setCurrentBranch] = useState<IBranch>({} as IBranch);
  const [sendingRequest, setSendingRequest] = useState<boolean>(false);
  const { branches } = useSelector((state: RootState) => state.BranchStore);
  const {
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

      <SettingsHeader handleCreationClicked={createBranch} title="Branch" />
      <Box>
        {loading ? (
          <Loading items="branches" />
        ) : branches.length > 0 ? (
          <Grid container spacing={3}>
            {branches.map((branch) => (
              <Grid item xs={12} sm={6} md={4} key={branch.id}>
                <ViewBranch branch={branch} deleteBranch={deleteBranch} updateBranch={updateBranch} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <NoContent item="branch" items="branches" />
        )}
      </Box>
    </>
  );
};

export default Branches;
