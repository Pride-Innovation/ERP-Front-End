/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Grid } from "@mui/material"
import ModalComponent from "../../../components/modal"
import Dispose from "../Dispose"
import TableComponent from "../../../components/tables/TableComponent"
import ITEquipmentUtills from "./utills"
import { useNavigate } from "react-router"
import { useEffect, useState } from "react"
import { ROUTES } from "../../../core/routes/routes"
import { ErrorMessage } from "../../../core/apis/axiosInstance"
import { fetchRowsService } from "../../../core/apis/globalService"
import { IITEquipmentsAxiosResponse } from "./interface"
import { useDispatch } from "react-redux"
import { AppDispatch, RootState } from "../../../store"
import { loadAllITAssets } from "./slice"
import { useSelector } from "react-redux"

const ITEquipment = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { itAssets } = useSelector((state: RootState) => state.ITAssetStore)
    const [count, setCount] = useState<number>(0)

    const {
        open,
        handleClose,
        endPoint,
        header,
        columnHeaders,
        module,
        handleOptionClicked,
        currentAsset,
        handleRequest,
        iTEquipmentTableData
    } = ITEquipmentUtills();

    const fetchResources = async () => {
        setLoading(true)
        try {
            const response = await fetchRowsService({ pageNumber: 0, pageSize: 10, endPoint }) as IITEquipmentsAxiosResponse;
            if (response.status === 200) {
                dispatch(loadAllITAssets(response.data.content));
                setCount(response.data.totalElements)
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : ErrorMessage;
            console.log(errorMessage)
        }
        setLoading(false)
    }

    useEffect(() => { fetchResources() }, []);
    useEffect(() => {
        if (itAssets.length > 0) {
            handleRequest(itAssets)
        }
    }, [itAssets])

    console.log(iTEquipmentTableData, "iTEquipmentTableData")

    return (
        <>
            {
                <ModalComponent width={"40%"} title='Dispose IT Equipment' open={open} handleClose={handleClose}>
                    <Dispose
                        handleClickAction={handleOptionClicked}
                        sendingRequest={loading}
                        handleClose={handleClose}
                        buttonText='Confirm'
                        asset={currentAsset}
                    />
                </ModalComponent>
            }
            <Grid xs={12} container>
                <TableComponent
                    endPoint={endPoint}
                    loading={loading}
                    count={count}
                    exportData
                    createAction
                    importData
                    header={header}
                    module={module}
                    rows={iTEquipmentTableData || []}
                    columnHeaders={columnHeaders}
                    onCreationHandler={() => navigate(ROUTES.CREATE_ITEQUIPMENT)}
                    handleOptionClicked={handleOptionClicked}
                />
            </Grid>
        </>
    )
}

export default ITEquipment;