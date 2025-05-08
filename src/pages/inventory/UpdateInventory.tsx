/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Paper, Box } from "@mui/material";
import InventoryForm from "./InventoryForm";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { IInventory, IUpdateInventory } from "./interface";
import { yupResolver } from "@hookform/resolvers/yup";
import { inventorySchema } from "./schema";
import { InventoryContext } from "../../context/inventory";

const UpdateInventory = ({ handleClose }: IUpdateInventory) => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { currentInventory } = useContext(InventoryContext);

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<IInventory>({
        mode: 'onChange',
        resolver: yupResolver(inventorySchema),
    });

    useEffect(() => {
        reset({ ...currentInventory });
    }, [reset, currentInventory]);

    const onSubmit = async (formData: IInventory) => {
        setSendingRequest(true);
        console.log(formData, "Submitted Inventory Data");
        // Simulate request
        setTimeout(() => setSendingRequest(false), 1000);
    };

    return (
        <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)} sx={{ px: 2, py: 1 }}>
            <Paper elevation={0} sx={{ p: 2 }}>
                <InventoryForm
                    handleClose={handleClose}
                    buttonText="Update Inventory"
                    formState={formState}
                    control={control}
                    sendingRequest={sendingRequest}
                    register={register}
                />
            </Paper>
        </Box>
    );
};

export default UpdateInventory;
