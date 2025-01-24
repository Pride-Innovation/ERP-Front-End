import { useEffect, useState } from "react"
import { listSuppliersService } from "../../assets/ITEquipment/service";
import { IFormData } from "../../assets/interface";
import { ISupplier } from "./interface";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { useDispatch } from "react-redux";
import { loadSuppliers } from "./slice";

const SupplierUtills = () => {
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const { suppliers } = useSelector((state: RootState) => state.SuppliersStore);
    const dispatch = useDispatch<AppDispatch>()
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const fetchAllSuppliers = async () => {
        const response = await listSuppliersService() as Array<ISupplier>;
        dispatch(loadSuppliers(response))
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