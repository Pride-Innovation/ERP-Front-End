/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import React, {
    useEffect,
    useState
} from "react";
import { useNavigate } from "react-router";
import { Grid } from "@mui/material";
import OfficeEquipmentUtills from "./utills";
import TableComponent from "../../../components/tables/TableComponent";
import { ROUTES } from "../../../core/routes/routes";
import ModalComponent from "../../../components/modal";
import Dispose from "../Dispose";
import { ErrorMessage } from "../../../core/apis/axiosInstance";
import { IITEquipmentsAxiosResponse } from "../ITEquipment/interface";
import { fetchRowsService } from "../../../core/apis/globalService";
import { loadAllITAssets } from "../ITEquipment/slice";
import AssetUtills from "../Utills";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store";

const OfficeEquipment = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const { currentAssetType, setCurrentAssetType } = AssetUtills();
    const dispatch = useDispatch<AppDispatch>();
    const [count, setCount] = useState<number>(0)

    const {
        columnHeaders,
        header,
        endPoint,
        handleOptionClicked,
        handleClose,
        open,
        module,
        currentAsset
    } = OfficeEquipmentUtills();

    const fetchResources = async () => {
        setLoading(true)

        const params = { assetTypeId: currentAssetType.id }

        try {
            const response = await fetchRowsService({
                pageNumber: 0,
                pageSize: 10,
                endPoint,
                params
            }) as IITEquipmentsAxiosResponse;
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

    return (
        <React.Fragment>
            {
                <ModalComponent width={"40%"} title='Dispose Office Equipment' open={open} handleClose={handleClose}>
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
                    {columnHeaders.length > 0 &&
                        <TableComponent
                            endPoint={endPoint}
                            loading={loading}
                            count={100}
                            exportData
                            createAction
                            importData
                            header={header}
                            module={module}
                            rows={[]}
                            columnHeaders={columnHeaders}
                            onCreationHandler={() => navigate(ROUTES.CREATE_OFFICE_EQUIPMENT)}
                            handleOptionClicked={handleOptionClicked}
                            paginationMode='client'
                        />
                    }
                </Grid>
        </React.Fragment>
    )
}

export default OfficeEquipment;