/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react"
import { IFormData } from "../../assets/interface";
import { ISupplier, ISuppliersAxiosResponse } from "./interface";
import { AppDispatch } from "../../../store";
import { useDispatch } from "react-redux";
import { addSupplier, loadSuppliers, removeSupplier, updateSupplier } from "./slice";
import { fetchRowsService } from "../../../core/apis/globalService";

const SupplierUtills = () => {
    const endPoint: string = "suppliers";
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const dispatch = useDispatch<AppDispatch>()
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const fetchAllSuppliers = async () => {
        try {
            const response = await fetchRowsService({ pageNumber: 0, pageSize: 10, endPoint }) as ISuppliersAxiosResponse;
            if (response.status === 200) {
                dispatch(loadSuppliers(response.data.content))
            }
        } catch (error) {
            console.log(error)
        }
    }

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
            value: "telephone",
            label: 'Telephone Number',
            type: "input"
        },
        {
            value: "address",
            label: 'Physical Address',
            type: "input"
        },
        {
            value: "email",
            label: 'Email Address',
            type: "input"
        }
    ]

    return ({
        handleClose,
        handleOpen,
        modalState,
        setModalState,
        open,
        formFields,
        addSupplierToStore,
        removeSupplierToStore,
        updateSupplierInStore,
        loading,
        fetchAllSuppliers
    }
    )
}

export default SupplierUtills