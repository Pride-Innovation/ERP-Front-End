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
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import { useContext, useState } from "react";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import InventoryUtills from "../inventory/Utills";
import UserUtils from "../users/utils";
import BranchUtills from "../settings/branch/utills";
import SupplierUtills from "../settings/suppliers/Utills";
import { fetchRowsService } from "../../core/apis/globalService";
import { IAsset, IAssetsAxiosResponse } from "./interface";
import { useDispatch } from "react-redux";
import { listAllAssets } from "./slice";
import { RequestContext } from "../../context/request/RequestContext";
import { statusIdByCode } from "../../utils/helpers";

const AssetUtills = () => {
    const [currentAssetType, setCurrentAssetType] = useState<IAssetType>({} as IAssetType);
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
    const { statuses } = useSelector((state: RootState) => state.StatusesStore);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [loading, setLoading] = useState<boolean>(false);
    const endPoint: string = "assets";
    const dispatch = useDispatch<AppDispatch>();
    const { setIssuableAssets } = useContext(RequestContext);

    const { fetchInventory } = InventoryUtills();
    const { fetchAllUsers } = UserUtils();
    const { fetchAllBranches } = BranchUtills();
    const { fetchAllSuppliers } = SupplierUtills();

    /**
     * Every asset category — including the previously hardcoded IT Equipment /
     * Office Equipment / Fleet — now resolves to the same parameterised
     * `/assets-mgt/assets/general/{typeId}` route. The icon is the only thing
     * still chosen by name so that the familiar three categories keep their
     * distinct tab icons; all other categories fall back to a generic icon.
     */
    const determineAssetTypeByAssetName = (assetType: IAssetType) => {
        const lower = (assetType.name ?? '').toLocaleLowerCase();
        const icon = lower.includes('it equipment')
            ? <SettingsBrightnessIcon />
            : lower.includes('office equipment')
                ? <BalanceIcon />
                : lower.includes('fleet')
                    ? <DirectionsCarFilledIcon />
                    : <CategoryOutlinedIcon />;

        return {
            id: assetType.id as number,
            text: assetType.name,
            path: `${ROUTES.LIST_GENERAL_ASSETS}/${assetType.id}`,
            otherRoutes: [
                `${ROUTES.LIST_GENERAL_ASSETS}/${assetType.id}/create`,
                `${ROUTES.LIST_GENERAL_ASSETS}/${assetType.id}/update`,
            ],
            icon,
        };
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

    /**
     * Loads assets into the shared engraved-number pool the issuance picker renders from.
     *
     * <p>Callers filter by commodity/status and rely on getting *every* match, not a page of them:
     * the pool feeds an Autocomplete with no paging control behind it. At the old pageSize of 10 an
     * issuer simply could not see the 11th available monitor except by typing its engraved number.
     */
    const fetchAllAssets = async (params?: Record<string, any>) => {
        setLoading(true)
        try {
            const response = await fetchRowsService({
                pageNumber: 0,
                pageSize: 200,
                endPoint,
                params
            }) as IAssetsAxiosResponse

            if (response.status === 200) {
                const fresh = response.data.content;
                const commodityId = params?.commodityId as number | undefined;

                /*
                 * A commodity's bucket is replaced by the query that covers it, not merged into.
                 *
                 * These queries all carry `assetStatusId = Available for Issuance`, so an asset that
                 * has been issued since the last look does not come back — and under the old
                 * append-only merge it therefore stayed forever, because nothing can overwrite a row
                 * that is no longer in any result. Replacing is the only operation that can remove
                 * it.
                 *
                 * A *search* is the one exception: it is narrowed by engraved number, so its result
                 * is a slice of the commodity rather than the whole of it, and treating that slice
                 * as the new truth would discard everything the user had not typed. Those merge, and
                 * the fresh copy still wins per id.
                 *
                 * Keyed by `id`, not `engravedNumber`: the id is the identity the server enforces
                 * on, and two assets awaiting completion both carry a blank engraved number, which
                 * collapsed them into one entry.
                 */
                if (commodityId != null) {
                    const isSearch = Boolean(params?.engravedNumber);
                    setIssuableAssets(prev => {
                        const base = isSearch ? (prev[commodityId] ?? []) : [];
                        const byId = new Map<number, IAsset>();
                        [...base, ...fresh].forEach(asset => {
                            if (asset?.id != null) byId.set(asset.id as number, asset);
                        });
                        return { ...prev, [commodityId]: Array.from(byId.values()) };
                    });
                }

                dispatch(listAllAssets(fresh));
            }
        } catch (error) {
            console.log(error)
        }
        setLoading(false)
    }


    // Resolve a status id from its code against the loaded status catalogue.
    // Replaces the previously hardcoded (and partly wrong) id map.
    const determineStatusId = (status: string) => statusIdByCode(statuses, status);

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