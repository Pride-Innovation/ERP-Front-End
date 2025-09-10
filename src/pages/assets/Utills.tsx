/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ROUTES } from "../../core/routes/routes"
import { IAssetType } from "../settings/assetTypes/interface"
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import BalanceIcon from '@mui/icons-material/Balance';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import { useContext, useState } from "react";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { assetTypesStatusConstants } from "../../utils/constants";
import InventoryUtills from "../inventory/Utills";
import UserUtils from "../users/utils";
import BranchUtills from "../settings/branch/utills";
import SupplierUtills from "../settings/suppliers/Utills";
import { fetchRowsService } from "../../core/apis/globalService";
import { IAssetsAxiosResponse } from "./interface";
import { useDispatch } from "react-redux";
import { listAllAssets } from "./slice";
import { RequestContext } from "../../context/request/RequestContext";

const AssetUtills = () => {
    const [currentAssetType, setCurrentAssetType] = useState<IAssetType>({} as IAssetType);
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
    const [loading, setLoading] = useState<boolean>(false);
    const endPoint: string = "assets";
    const dispatch = useDispatch<AppDispatch>();
    const { setAssetsEngravedInStore } = useContext(RequestContext);

    const { fetchInventory } = InventoryUtills();
    const { fetchAllUsers } = UserUtils();
    const { fetchAllBranches } = BranchUtills();
    const { fetchAllSuppliers } = SupplierUtills();

    const determineAssetTypeByAssetName = (assetType: IAssetType) => {

        if (assetType.name.toLocaleLowerCase().indexOf(
            assetTypesStatusConstants.itEquipment.toLocaleLowerCase()
        ) !== -1) {
            return ({
                id: assetType.id as number,
                text: assetType.name,
                path: ROUTES.LIST_ASSETS,
                otherRoutes: [
                    ROUTES.CREATE_ITEQUIPMENT,
                    ROUTES.UPDATE_ITEQUIPMENT
                ],
                icon: <SettingsBrightnessIcon />,
                // permission: routePermission(8) as IPermission
            })
        }

        if (assetType.name.toLocaleLowerCase().indexOf(
            assetTypesStatusConstants.officeEquipment.toLocaleLowerCase()
        ) !== -1) {
            return ({
                id: assetType.id as number,
                text: assetType.name,
                path: ROUTES.LIST_OFFICE_EQUIPMENT,
                otherRoutes: [
                    ROUTES.CREATE_OFFICE_EQUIPMENT,
                    ROUTES.UPDATE_OFFICE_EQUIPMENT
                ],
                icon: <BalanceIcon />,
                // permission: routePermission(12) as IPermission
            })
        }

        if (assetType.name.toLocaleLowerCase().indexOf(
            assetTypesStatusConstants.fleet.toLocaleLowerCase()
        ) !== -1) {
            return ({
                id: assetType.id as number,
                text: assetType.name,
                path: ROUTES.LIST_FLEET,
                otherRoutes: [
                    ROUTES.CREATE_FLEET,
                    ROUTES.UPDATE_FLEET
                ],
                icon: <DirectionsCarFilledIcon />,
                // permission: routePermission(16) as IPermission
            })
        }

    }

    const determineAssetTypeState = (id: number): IAssetType => {
        return assetTypes.find(typ => typ.id === id) as IAssetType
    }


    const searchStockByLPONumber = async (lpoNumber: string) => {
        try {
            const params = { lpoNumber }
            await fetchInventory(params);
        } catch (error) {
            console.log(error)
        }
    }


    const searchUserByName = async (firstName: string) => {
        try {
            const params = { firstName }
            await fetchAllUsers(params);
        } catch (error) {
            console.log(error)
        }
    }


    const searchBranchByName = async (name: string) => {
        try {
            const params = { name }
            await fetchAllBranches(params);
        } catch (error) {
            console.log(error)
        }
    }

    const searchSupplierByName = async (name: string) => {
        try {
            const params = { name }
            await fetchAllSuppliers(params);
        } catch (error) {
            console.log(error)
        }
    }

    const fetchAllAssets = async (params?: Record<string, any>) => {
        setLoading(true)
        try {
            const response = await fetchRowsService({
                pageNumber: 0,
                pageSize: 10,
                endPoint,
                params
            }) as IAssetsAxiosResponse

            if (response.status === 200) {
                setAssetsEngravedInStore(prev => {
                    const merged = [...response.data.content, ...prev];
                    const uniqueByName = Array.from(new Map(merged.map(item => [item.engravedNumber, item])).values());
                    return uniqueByName;
                });
                dispatch(listAllAssets(response.data.content));
            }
        } catch (error) {
            console.log(error)
        }
        setLoading(false)
    }


    const determineStatusId = (status: string) => {
        switch (status) {
            case 'requireUpdate':
                return 9;
            case 'issuanceAvailable':
                return 8;
            case 'receiptAcknowledged':
                return 7;
            case 'inStore':
                return 12;
            case 'inMaintenance':
                return 13;
            default:
                return null;
        }
    }

    return ({
        determineAssetTypeByAssetName,
        currentAssetType,
        setCurrentAssetType,
        determineAssetTypeState,
        searchStockByLPONumber,
        searchUserByName,
        searchBranchByName,
        searchSupplierByName,
        fetchAllAssets,
        determineStatusId,
    })
}

export default AssetUtills