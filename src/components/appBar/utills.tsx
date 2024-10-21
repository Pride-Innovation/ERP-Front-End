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
    assets: "assets",
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
                { value: modalStates.assets, label: "Assets", icon: <TuneIcon fontSize='small' color='info' /> },
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
        if (modalStates.password === option) {
            setModalState(modalStates.password)
            handleOpen();
        }
        if (modalStates.logout === option) {
            navigate(ROUTES.LOGIN)
        }
        if (modalStates.profile === option) {
            navigate(`${ROUTES.PROFILE}/${user.id}`)
        }
        if (modalStates.leave === option) {
            setModalState(modalStates.leave)
            handleOpen();
        }
        if (modalStates.assets === option) {
            navigate(ROUTES.CREATE_ITEQUIPMENT)
        }
    }


    return ({
        handleClose,
        modalState,
        open,
        handleOptionClicked,
        options
    })
}

export default AppBarUtills