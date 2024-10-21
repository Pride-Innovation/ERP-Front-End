import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { ROUTES } from "../../core/routes/routes";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { crudStates } from "../../utils/constants";
import TuneIcon from '@mui/icons-material/Tune';
import { UserContext } from "../../context/user/UserContext";

export const modalStates = {
    password: "password",
    profile: "profile",
    logout: "logout",
    settings: "settings",
    leave: "leave",
    officeEquipment: "officeEquipment",
    itEquipment: "itEquipment",
    fleet: "fleet",
}


const AppBarUtills = () => {
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const navigate = useNavigate();
    const { user } = useContext(UserContext);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const options = (action: string) =>
        action === crudStates.create ? (
            [
                { value: modalStates.itEquipment, label: "IT Equipment", icon: <TuneIcon fontSize='small' color='info' /> },
                { value: modalStates.officeEquipment, label: "Office Equipment", icon: <TuneIcon fontSize='small' color='info' /> },
                { value: modalStates.fleet, label: "Fleet", icon: <TuneIcon fontSize='small' color='info' /> },
            ]
        ) :
            (
                [
                    { value: modalStates.settings, label: "Settings", header: true },
                    { value: modalStates.profile, label: "Profile", icon: <PersonOutlineIcon fontSize='small' color='info' /> },
                    { value: modalStates.password, label: "Change Password", icon: <LockOpenOutlinedIcon fontSize='small' color='info' /> },
                    { value: modalStates.logout, label: "Log Out", header: true, icon: <LogoutOutlinedIcon fontSize='small' color='info' /> }
                ]
            )

    const handleOptionClicked = (option: string | number) => {
        switch (option) {
            case modalStates.password:
                setModalState(modalStates.password);
                handleOpen();
                break;
            case modalStates.logout:
                navigate(ROUTES.LOGIN);
                break;
            case modalStates.profile:
                navigate(`${ROUTES.PROFILE}/${user.id}`);
                break;
            case modalStates.leave:
                setModalState(modalStates.leave);
                handleOpen();
                break;
            case modalStates.itEquipment:
                navigate(ROUTES.CREATE_ITEQUIPMENT);
                break;
            case modalStates.officeEquipment:
                navigate(ROUTES.CREATE_OFFICE_EQUIPMENT);
                break;
            case modalStates.fleet:
                navigate(ROUTES.CREATE_FLEET);
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