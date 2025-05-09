/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react"
import { IFormData } from "../../assets/interface";
import { ISupplier } from "./interface";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { useDispatch } from "react-redux";
import { addSupplier, loadSuppliers, removeSupplier, updateSupplier } from "./slice";
import { listSuppliersService } from "./service";

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

    const addSupplierToStore = (supplier: ISupplier) => {
        dispatch(addSupplier(supplier))
    }

    const removeSupplierToStore = (supplier: ISupplier) => {
        dispatch(removeSupplier(supplier))
    }

    const updateSupplierInStore = (supplier: ISupplier) => {
        dispatch(updateSupplier(supplier))
    }

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
        formFields,
        addSupplierToStore,
        removeSupplierToStore,
        updateSupplierInStore
    }
    )
}

export default SupplierUtills