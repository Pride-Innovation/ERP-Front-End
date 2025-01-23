import { useEffect, useState } from "react"
import { ISupplier } from "../../assets/ITEquipment/interface"
import { listSuppliersService } from "../../assets/ITEquipment/service";

const SupplierUtills = () => {
    const [suppliers, setSuppliers] = useState<ISupplier[]>([] as Array<ISupplier>);
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const fetchAllSuppliers = async () => {
        const response = await listSuppliersService() as Array<ISupplier>;
        setSuppliers(response)
    }

    useEffect(() => { fetchAllSuppliers() }, [])
    return ({
        suppliers,
        handleClose,
        handleOpen,
        modalState,
        setModalState,
        open
    }
    )
}

export default SupplierUtills