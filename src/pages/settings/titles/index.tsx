import { Box, Card, Grid, InputAdornment, TextField, useMediaQuery, useTheme } from "@mui/material"
import ModalComponent from "../../../components/modal"
import { crudStates } from "../../../utils/constants"
import TitleUtills from "./utills"
import { ChangeEvent, useEffect, useState } from "react"
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ButtonComponent from "../../../components/forms/Button"
import Loading from "../../../components/loading"
import NoContent from "../../../components/noContent"
import { ITitle } from "./interface"
import { useSelector } from "react-redux"
import { RootState } from "../../../store"
import TitleCard from "./TitleCard"
import CreateTitle from "./CreateTitle"

const Titles = () => {
  const [currentTitle, setCurrentTitle] = useState<ITitle>({} as ITitle);
  const [sendingRequest, setSendingRequest] = useState<boolean>(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
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
          {/* <UpdateBranch
            branch={currentTitle}
            handleClose={handleClose}
            setSendingRequest={setSendingRequest}
            sendingRequest={sendingRequest}
          /> */}
          <p>Update Title</p>
        </ModalComponent>
      )}
      {modalState === crudStates.delete && (
        <ModalComponent width="35%" title="Delete Title" open={open} handleClose={handleClose}>
          {/* <DeleteBranch
            branch={currentTitle}
            handleClose={handleClose}
            setSendingRequest={setSendingRequest}
            sendingRequest={sendingRequest}
            buttonText="Delete"
          /> */}
          <p>Delete Title</p>
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
          placeholder="Filter by name"
          size="small"
          onChange={(e: ChangeEvent<HTMLInputElement>) => console.log(e.target.value)}
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
          handleClick={createTitle}
          sendingRequest={false}
          buttonText="Create New Title"
          variant="contained"
          buttonColor="info"
          type="button"
        />
      </Card>

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