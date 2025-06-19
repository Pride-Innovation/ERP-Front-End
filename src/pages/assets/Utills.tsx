import { ROUTES } from "../../core/routes/routes"
import { IAssetType } from "../settings/assetTypes/interface"
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import BalanceIcon from '@mui/icons-material/Balance';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { assetTypesStatusConstants } from "../../utils/constants";

const AssetUtills = () => {
    const [currentAssetType, setCurrentAssetType] = useState<IAssetType>({} as IAssetType);
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);

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

    return ({
        determineAssetTypeByAssetName,
        currentAssetType,
        setCurrentAssetType,
        determineAssetTypeState
    })
}

export default AssetUtills