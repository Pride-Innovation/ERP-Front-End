import { useEffect, useState } from "react"
import { ISupplier } from "../../assets/ITEquipment/interface"
import { listSuppliersService } from "../../assets/ITEquipment/service";
import { IFormData } from "../../assets/interface";

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

    useEffect(() => { fetchAllSuppliers() }, []);

    const formFields: Array<IFormData<ISupplier>> = [
        {
            value: "name",
            label: 'Supplier Name',
            type: "input"
        },
        {
            value: "email",
            label: 'Supplier Email',
            type: "input"
        },
        {
            value: "tel",
            label: 'Supplier Telephone',
            type: "input"
        },
        {
            value: "status",
            label: 'Supplier Status',
            type: "select",
            options: [
                {
                    label: "Full Supplier",
                    value: 1
                },
                {
                    label: "Minor Supplier",
                    value: 2
                }
            ]
        },
        {
            value: "desc",
            label: 'Description',
            type: "textarea"
        }]

    return ({
        suppliers,
        handleClose,
        handleOpen,
        modalState,
        setModalState,
        open,
        formFields
    }
    )
}

export default SupplierUtills