/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/


import { ChangeEvent, useEffect, useState } from 'react'
import { ICommodity } from './interface';
import { crudStates } from '../../../utils/constants';
import CommodityUtills from './utills';
import ModalComponent from '../../../components/modal';
import { Box, Card, Grid, InputAdornment, TextField, useMediaQuery, useTheme } from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ButtonComponent from '../../../components/forms/Button';
import Loading from '../../../components/loading';
import NoContent from '../../../components/noContent';
import CreateCommodity from './CreateCommodity';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import CommodityCard from './ViewCommodity';
import SettingsHeader from '../../../components/settingsNavigationCard';
import UpdateCommodity from './UpdateCommodity';
import DeleteCommodity from './DeleteCommodity';


const Commodities = () => {
  const [currentCommodity, setCurrentCommodity] = useState<ICommodity>({} as ICommodity);
  const [sendingRequest, setSendingRequest] = useState<boolean>(false);
  const { commodities } = useSelector((state: RootState) => state.CommodityStore)

  const { modalState, handleClose, open, handleOpen, setModalState, loading, fetchAllCommodities } = CommodityUtills()

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  useEffect(() => { fetchAllCommodities() }, [])

  const createCommodity = () => {
    setModalState(crudStates.create);
    handleOpen();
  };

  const updateCommodity = (commodity: ICommodity) => {
    setCurrentCommodity(commodity);
    setModalState(crudStates.update);
    handleOpen();
  };

  const deleteCommodity = (commodity: ICommodity) => {
    setCurrentCommodity(commodity);
    setModalState(crudStates.delete);
    handleOpen();
  };


  return (
    <>
      {modalState === crudStates.create && (
        <ModalComponent width="45%" title="Create Commodity" open={open} handleClose={handleClose}>
          <CreateCommodity
            handleClose={handleClose}
            sendingRequest={sendingRequest}
            setSendingRequest={setSendingRequest}
          />
        </ModalComponent>
      )}
      {modalState === crudStates.update && (
        <ModalComponent width="50%" title="Update Commodity" open={open} handleClose={handleClose}>
          <UpdateCommodity
            commodity={currentCommodity}
            handleClose={handleClose}
            setSendingRequest={setSendingRequest}
            sendingRequest={sendingRequest}
          />
        </ModalComponent>
      )}
      {modalState === crudStates.delete && (
        <ModalComponent width="35%" title="Delete Commodity" open={open} handleClose={handleClose}>
          <DeleteCommodity
            commodity={currentCommodity}
            handleClose={handleClose}
            setSendingRequest={setSendingRequest}
            sendingRequest={sendingRequest}
            buttonText="Delete"
          />
        </ModalComponent>
      )}
      <SettingsHeader handleCreationClicked={createCommodity} title="Commodity" />
      <Box>
        {loading ? (
          <Loading items='commodities' />
        )
          : commodities.length > 0 ? (
            <Grid container spacing={3}>
              {commodities.map((commodity) => (
                <Grid item xs={12} sm={6} md={4} key={commodity.id}>
                  <CommodityCard commodity={commodity} deleteCommodity={deleteCommodity} updateCommodity={updateCommodity} />
                </Grid>
              ))}
            </Grid>
          )

            : (
              <NoContent item="commodity" items="commodities" />
            )}
      </Box>
    </>
  )
}

export default Commodities