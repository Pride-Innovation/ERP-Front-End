/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Grid } from "@mui/material";
import React, { useEffect, useState } from "react";
import TableComponent from "../../../components/tables/TableComponent";
import { useNavigate } from "react-router";
import FleetUtills from "./utills";
import { ROUTES } from "../../../core/routes/routes";
import { IFleetsAxiosResponse } from "./interface";
import ModalComponent from "../../../components/modal";
import { fetchRowsService } from "../../../core/apis/globalService";
import AssetUtills from "../Utills";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { loadAllFleet } from "./slice";
import { useSelector } from "react-redux";

const Fleet = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [count, setCount] = useState<number>(0)
    const navigate = useNavigate();
    const { currentAssetType, setCurrentAssetType } = AssetUtills();
    const dispatch = useDispatch<AppDispatch>()
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
    const { fleetAssets } = useSelector((state: RootState) => state.FleetStore)

    const {
        columnHeaders,
        header,
        endPoint,
        open,
        handleClose,
        handleOptionClicked,
        handleFleetTableData,
        fleetTableData,
        module,
        determineFleetAssetType
    } = FleetUtills();

    const fetchResources = async () => {
        setLoading(true)

        const params = { assetTypeId: currentAssetType.id }

        try {
            const response = await fetchRowsService({
                pageNumber: 0,
                pageSize: 10,
                endPoint,
                params
            }) as IFleetsAxiosResponse;
            if (response.status === 200) {
                dispatch(loadAllFleet(response.data.content));
                setCount(response.data.totalElements)
            }
        } catch (error) {
            console.log(error)
        }
        setLoading(false)
    }

    useEffect(() => {
        if (assetTypes.length > 0) {
            const assetType = determineFleetAssetType()
            setCurrentAssetType(assetType);
        }
    }, [assetTypes]);

    useEffect(() => {
        if (currentAssetType.id) {
            fetchResources()
        }
    }, [currentAssetType])


    useEffect(() => {
        if (fleetAssets.length > 0) {
            handleFleetTableData(fleetAssets)
        }
    }, [fleetAssets])



    return (
        <React.Fragment>
            {
                <ModalComponent width={"40%"} title='Dispose Fleet' open={open} handleClose={handleClose}>
                    {/* <Dispose
                        sendingRequest={loading}
                        handleClose={handleClose}
                        buttonText='Confirm'
                        asset={currentAsset}
                    /> */}
                    <p>Dispose off asset</p>
                </ModalComponent>
            }
            <Grid xs={12} container>
                {columnHeaders.length > 0 &&
                    <TableComponent
                        endPoint={endPoint}
                        loading={loading}
                        count={count}
                        exportData
                        createAction
                        module={module}
                        importData
                        header={header}
                        rows={fleetTableData || []}
                        columnHeaders={columnHeaders}
                        onCreationHandler={() => navigate(ROUTES.CREATE_FLEET)}
                        handleOptionClicked={handleOptionClicked}
                        paginationMode='server'
                        params={{ assetTypeId: currentAssetType.id }}
                    />
                }
            </Grid>
        </React.Fragment>
    )
}

export default Fleet