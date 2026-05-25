/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { ROUTES } from "../../core/routes/routes";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { crudStates } from "../../utils/constants";
import BalanceIcon from '@mui/icons-material/Balance';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import DirectionsCarFilledIcon from '@mui/icons-material/DirectionsCarFilled';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import AuthenticationUtils from "../../pages/authentication/utills";
import RoutesUtills from "../../core/routes/utills";
import { RootState } from "../../store";
import { IAssetType } from "../../pages/settings/assetTypes/interface";

export const modalStates = {
    password: "password",
    profile: "profile",
    logout: "logout",
    settings: "settings",
    leave: "leave",
    image: "image"
}

/**
 * Pseudo-state used by the "Create" menu — every value here is a *prefix*
 * followed by the asset-type ID. The handler strips the prefix and navigates
 * to `/assets-mgt/assets/general/{typeId}/create`. This is how we keep the
 * "create" affordance category-aware without hard-coding any category route.
 */
const CREATE_ASSET_PREFIX = 'create-asset:';

/** Choose a recognisable icon for the well-known category names; fall back to a generic one. */
const iconForAssetType = (name: string) => {
    const lower = (name ?? '').toLocaleLowerCase();
    if (lower.includes('it equipment')) return <SettingsBrightnessIcon fontSize='small' color='success' />;
    if (lower.includes('office equipment')) return <BalanceIcon fontSize='small' color='success' />;
    if (lower.includes('fleet')) return <DirectionsCarFilledIcon fontSize='small' color='success' />;
    return <CategoryOutlinedIcon fontSize='small' color='success' />;
};


const AppBarUtills = () => {
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const navigate = useNavigate();
    const { handleLogout } = AuthenticationUtils()
    const { getCurrentUser } = RoutesUtills();
    // Build the "Create" menu directly from the configured asset categories so
    // adding a new category in Settings → Asset Categories automatically gives
    // it a Create entry — no code change required.
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const options = (action: string) =>
        action === crudStates.create
            ? (assetTypes as IAssetType[]).map((type) => ({
                value: `${CREATE_ASSET_PREFIX}${type.id}`,
                label: type.name,
                icon: iconForAssetType(type.name),
            }))
            : (
                [
                    { value: modalStates.settings, label: "Settings", header: true },
                    { value: modalStates.profile, label: "Profile", icon: <PersonOutlineIcon fontSize='small' color='success' /> },
                    { value: modalStates.password, label: "Change Password", icon: <LockOpenOutlinedIcon fontSize='small' color='success' /> },
                    { value: modalStates.logout, label: "Log Out", header: true, icon: <LogoutOutlinedIcon fontSize='small' color='error' /> }
                ]
            )

    const handleOptionClicked = (option: string | number) => {
        const optionStr = String(option);

        // Dynamic asset-create entries are encoded as `create-asset:{typeId}`.
        if (optionStr.startsWith(CREATE_ASSET_PREFIX)) {
            const typeId = optionStr.slice(CREATE_ASSET_PREFIX.length);
            navigate(`${ROUTES.LIST_GENERAL_ASSETS}/${typeId}/create`);
            return;
        }

        switch (option) {
            case modalStates.password:
                setModalState(modalStates.password);
                handleOpen();
                break;
            case modalStates.logout:
                handleLogout();
                navigate(ROUTES.LOGIN);
                break;
            case modalStates.profile:
                navigate(`${ROUTES.PROFILE}/${getCurrentUser()?.id}`);
                break;
            case modalStates.leave:
                setModalState(modalStates.leave);
                handleOpen();
                break;
            case modalStates.image:
                setModalState(modalStates.image);
                handleOpen();
                break;
            default:
                break;
        }
    };

    return ({
        handleClose,
        modalState,
        open,
        handleOptionClicked,
        options
    })
}

export default AppBarUtills
