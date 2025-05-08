import { Box, Grid, Paper } from "@mui/material"
import { ICreateInventory, IInventory } from "./interface"
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { inventorySchema } from "./schema";
import InventoryForm from "./InventoryForm";

const CreateInventory = ({ handleClose }: ICreateInventory) => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);

    const defaultInventory: IInventory = {} as IInventory;

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
        reset({ ...defaultInventory });
    }, [reset]);

    const onSubmit = async (formData: IInventory) => {
        setSendingRequest(true);
        console.log(formData, "Form Data!!")
        setSendingRequest(false);
    }
    return (
        <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit(onSubmit)} sx={{ px: 2, py: 1 }}>
            <Paper elevation={0} sx={{ p: 2 }}>
                <InventoryForm
                    handleClose={handleClose}
                    buttonText="Submit"
                    formState={formState}
                    control={control}
                    sendingRequest={sendingRequest}
                    register={register}
                />
            </Paper>
        </Box >
    )
}

export default CreateInventory