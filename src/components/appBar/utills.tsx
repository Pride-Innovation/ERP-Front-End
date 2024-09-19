import { useState } from "react";
import { useNavigate } from "react-router";
import { ROUTES } from "../../core/routes/routes";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

export const modalStates = {
    password: "password",
    profile: "profile",
    logout: "logout",
    settings: "settings",
    leave: "leave",
}


const AppBarUtills = () => {
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const options = () => (
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
            navigate(ROUTES.PROFILE)
        }
        if (modalStates.leave === option) {
            setModalState(modalStates.leave)
            handleOpen();
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