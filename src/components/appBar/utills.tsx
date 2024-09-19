import { useState } from "react";

const AppBarUtills = () => {
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    return ({
        handleClose, handleOpen, modalState, setModalState, open
    }
    )
}

export default AppBarUtills