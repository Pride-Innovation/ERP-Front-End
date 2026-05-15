/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react"
import { IFormData } from "../../assets/interface";
import { ISupplier, ISuppliersAxiosResponse } from "./interface";
import { AppDispatch, RootState } from "../../../store";
import { useDispatch } from "react-redux";
import { addSupplier, loadSuppliers, removeSupplier, updateSupplier, setPaginationMeta } from "./slice";
import { fetchRowsService } from "../../../core/apis/globalService";
import { IOptions } from "../../../components/tables/interface";
import { useSelector } from "react-redux";

const SupplierUtills = () => {
    const endPoint: string = "suppliers";
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const dispatch = useDispatch<AppDispatch>()
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const { commodities } = useSelector((state: RootState) => state.CommodityStore);
    const [optionsObject, setOptionsObject] = useState<{
        commodityOptions: Array<IOptions>
    }>({
        commodityOptions: []
    });

    const fetchAllSuppliers = async ({
        pageNumber = 0,
        pageSize = 9,
        name,
        email,
        address,
        telephone,
    }: {
        pageNumber?: number;
        pageSize?: number;
        name?: string;
        email?: string;
        address?: string;
        telephone?: string;
    } = {}) => {
        setLoading(true)
        try {
            const params: Record<string, any> = {};
            if (name) params.name = name;
            if (email) params.email = email;
            if (address) params.address = address;
            if (telephone) params.telephone = telephone;

            const response = await fetchRowsService({
                pageNumber,
                pageSize,
                endPoint,
                params
            }) as ISuppliersAxiosResponse;
            if (response.status === 200) {
                dispatch(loadSuppliers(response.data.content));
                dispatch(setPaginationMeta({
                    totalPages: response.data.totalPages,
                    totalElements: response.data.totalElements,
                }));
            }
        } catch (error) {
            console.log(error)
        }
        setLoading(false)
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

    useEffect(() => {
        if (commodities.length > 0) {
            setOptionsObject({
                commodityOptions: commodities.map(commodity => ({ label: commodity.name, value: commodity.id as number })) || []
            })
        }
    }, [commodities])

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
        },
        {
            value: "commodities",
            label: 'Supplied Commodities',
            type: "autocomplete",
            options: optionsObject.commodityOptions,
            multiple: true
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