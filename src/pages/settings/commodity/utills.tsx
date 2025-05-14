/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/


import { useState } from "react";
import { ICommodity } from "./interface";
import { IFormData } from "../../assets/interface";

const CommodityUtills = () => {
    const [modalState, setModalState] = useState<string>("");
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const addCommodityToStore = (commodity: ICommodity) => {

    }

    const formFields: Array<IFormData<ICommodity>> = [
        {
            value: "name",
            label: 'Commodity Name',
            type: "input"
        },
        {
            value: "groupName",
            label: 'Group Name',
            type: "input"
        },
        {
            value: "assetType",
            label: "Asset Type",
            type: "select",
            // options: optionsObject.usersOptions
            options: []
        }
    ]
    return ({
        handleClose,
        handleOpen,
        modalState,
        open,
        loading,
        setModalState,
        setLoading,
        addCommodityToStore,
        formFields
    }
    )
}

export default CommodityUtills