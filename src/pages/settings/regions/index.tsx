/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react";
import RegionUtills from "./utills";
import { IRegion } from "../branch/interface";
import { crudStates } from "../../../utils/constants";
import ModalComponent from "../../../components/modal";
import SettingsHeader from "../../../components/settingsNavigationCard";
import { Box, Grid } from "@mui/material";
import Loading from "../../../components/loading";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import NoContent from "../../../components/noContent";
import RegionDetails from "./RegionDetails";

const Regions = () => {
    const {
        setModalState,
        handleClose,
        handleOpen,
        modalState,
        open,
        loading,
        fetchAllRegions
    } = RegionUtills();
    const [currentRegion, setCurrentRegion] = useState<IRegion>({} as IRegion);
    const { regions } = useSelector((state: RootState) => state.RegionStore);
    useEffect(() => { fetchAllRegions() }, [])

    const createRegion = () => {
        setModalState(crudStates.create);
        handleOpen()
    }

    const updateRegion = (region: IRegion) => {
        setCurrentRegion(region)
        setModalState(crudStates.update);
        handleOpen()
    }

    const deleteRegion = (region: IRegion) => {
        setCurrentRegion(region)
        setModalState(crudStates.delete);
        handleOpen()
    }
    return (
        <>
            {
                crudStates.create === modalState && <ModalComponent width={"40%"} title='Create Region' open={open} handleClose={handleClose}>
                    {/* <CreateRegion handleClose={handleClose} sendingRequest={sendingRequest} setSendingRequest={setSendingRequest} /> */}
                    <p>Create Region</p>
                </ModalComponent>
            }
            {
                crudStates.delete === modalState && <ModalComponent width={"35%"} title='Delete Region' open={open} handleClose={handleClose}>
                    {/* <DeleteRegion
                        region={currentRegion}
                        handleClose={handleClose}
                        sendingRequest={sendingRequest}
                        setSendingRequest={setSendingRequest}
                        buttonText='Delete'
                    /> */}
                    <p>Delete Region</p>
                </ModalComponent>
            }
            {
                crudStates.update === modalState && <ModalComponent width={"50%"} title='Update Region' open={open} handleClose={handleClose}>
                    {/* <UpdateRegion
                        handleClose={handleClose}
                        sendingRequest={sendingRequest}
                        setSendingRequest={setSendingRequest}
                        region={currentRegion}
                    /> */}
                    <p>Update Region</p>
                </ModalComponent>
            }
            <SettingsHeader handleCreationClicked={createRegion} title='region' />
            <Box>
                {loading ? (
                    <Loading items="Regions" />
                ) : regions.length > 0 ? (
                    <Grid container spacing={3}>
                        {regions.map((region) => (
                            <Grid item xs={12} sm={6} md={4} key={region.id}>
                                <RegionDetails region={region} deleteRegion={deleteRegion} updateRegion={updateRegion} />
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <NoContent item="region" items="regions" />
                )}
            </Box>
        </>
    )
}

export default Regions