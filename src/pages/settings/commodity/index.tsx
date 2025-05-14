import { ChangeEvent, useState } from 'react'
import { ICommodity } from './interface';
import { crudStates } from '../../../utils/constants';
import CommodityUtills from './utills';
import ModalComponent from '../../../components/modal';
import { Box, Card, InputAdornment, TextField, useMediaQuery, useTheme } from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ButtonComponent from '../../../components/forms/Button';
import Loading from '../../../components/loading';
import NoContent from '../../../components/noContent';
import CreateCommodity from './CreateCommodity';


const Commodities = () => {
  const [currentCommodity, setCurrentCommodity] = useState<ICommodity>({} as ICommodity);
  const [sendingRequest, setSendingRequest] = useState<boolean>(false);

  const { modalState, handleClose, open, handleOpen, setModalState, loading } = CommodityUtills()

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const createCommodity = () => {
    setModalState(crudStates.create);
    handleOpen();
  };

  return (
    <>
      {modalState === crudStates.create && (
        <ModalComponent width="40%" title="Create Commodity" open={open} handleClose={handleClose}>
          <CreateCommodity
            handleClose={handleClose}
            sendingRequest={sendingRequest}
            setSendingRequest={setSendingRequest}
          />
        </ModalComponent>
      )}
      {modalState === crudStates.update && (
        <ModalComponent width="50%" title="Update Commodity" open={open} handleClose={handleClose}>
          {/* <UpdateBranch
            branch={currentBranch}
            handleClose={handleClose}
            setSendingRequest={setSendingRequest}
            sendingRequest={sendingRequest}
          /> */}
          <p>Update Commodity</p>
        </ModalComponent>
      )}
      {modalState === crudStates.delete && (
        <ModalComponent width="35%" title="Delete Commodity" open={open} handleClose={handleClose}>
          {/* <DeleteBranch
            branch={currentBranch}
            handleClose={handleClose}
            setSendingRequest={setSendingRequest}
            sendingRequest={sendingRequest}
            buttonText="Delete"
          /> */}
          <p>Delete Commodity</p>
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
          onChange={(e: ChangeEvent<HTMLInputElement>) => console.log("Filter by name")}
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
          handleClick={createCommodity}
          sendingRequest={false}
          buttonText="Create New Commodity"
          variant="contained"
          buttonColor="info"
          type="button"
        />
      </Card>

      <Box>
        {loading ? (
          <Loading items='commodities' />
        )
          // : branches.length > 0 ? (
          //   <Grid container spacing={3}>
          //     {branches.map((branch) => (
          //       <Grid item xs={12} sm={6} md={4} key={branch.id}>
          //         <ViewBranch branch={branch} deleteBranch={deleteBranch} updateBranch={updateBranch} />
          //       </Grid>
          //     ))}
          //   </Grid>
          // ) 

          : (
            <NoContent item="commodity" items="commodities" />
          )}
      </Box>
    </>
  )
}

export default Commodities