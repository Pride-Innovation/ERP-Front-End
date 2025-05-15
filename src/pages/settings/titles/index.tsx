/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Grid } from "@mui/material"
import ModalComponent from "../../../components/modal"
import { crudStates } from "../../../utils/constants"
import TitleUtills from "./utills"
import { useEffect, useState } from "react"
import Loading from "../../../components/loading"
import NoContent from "../../../components/noContent"
import { ITitle } from "./interface"
import { useSelector } from "react-redux"
import { RootState } from "../../../store"
import TitleCard from "./TitleCard"
import CreateTitle from "./CreateTitle"
import SettingsHeader from "../../../components/settingsNavigationCard"
import UpdateTitle from "./UpdateTitle"
import DeleteTitle from "./DeleteTitle"

const Titles = () => {
  const [currentTitle, setCurrentTitle] = useState<ITitle>({} as ITitle);
  const [sendingRequest, setSendingRequest] = useState<boolean>(false);

  const { titles } = useSelector((state: RootState) => state.TitleStore)

  const {
    modalState,
    handleClose,
    open,
    loading,
    setModalState,
    handleOpen,
    fetchAllTitles
  } = TitleUtills();

  useEffect(() => { fetchAllTitles() }, []);

  const createTitle = () => {
    setModalState(crudStates.create);
    handleOpen();
  };

  const updateTitle = (title: ITitle) => {
    setCurrentTitle(title);
    setModalState(crudStates.update);
    handleOpen();
  };

  const deleteTitle = (title: ITitle) => {
    setCurrentTitle(title);
    setModalState(crudStates.delete);
    handleOpen();
  };

  return (
    <>
      {modalState === crudStates.create && (
        <ModalComponent width="45%" title="Create Title" open={open} handleClose={handleClose}>
          <CreateTitle
            handleClose={handleClose}
            sendingRequest={sendingRequest}
            setSendingRequest={setSendingRequest}
          />
        </ModalComponent>
      )}
      {modalState === crudStates.update && (
        <ModalComponent width="50%" title="Update Title" open={open} handleClose={handleClose}>
          <UpdateTitle
            title={currentTitle}
            handleClose={handleClose}
            setSendingRequest={setSendingRequest}
            sendingRequest={sendingRequest}
          />
        </ModalComponent>
      )}
      {modalState === crudStates.delete && (
        <ModalComponent width="35%" title="Delete Title" open={open} handleClose={handleClose}>
          <DeleteTitle
            title={currentTitle}
            handleClose={handleClose}
            setSendingRequest={setSendingRequest}
            sendingRequest={sendingRequest}
            buttonText="Delete"
          />
        </ModalComponent>
      )}
      <SettingsHeader handleCreationClicked={createTitle} title="Title" />
      <Box>
        {loading ? (
          <Loading items="titles" />
        ) : titles.length > 0 ? (
          <Grid container spacing={3}>
            {titles.map((title) => (
              <Grid item xs={12} sm={6} md={4} key={title.id}>
                <TitleCard title={title} deleteTitle={deleteTitle} updateTitle={updateTitle} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <NoContent item="title" items="titles" />
        )}
      </Box>
    </>
  )
}

export default Titles