import { Grid } from "@mui/material"
import InventoryForm from "./InventoryForm"
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { IInventory, IUpdateInventory } from "./interface";
import { yupResolver } from "@hookform/resolvers/yup";
import { inventorySchema } from "./schema";
import InventoryUtills from "./Utills";
import { InventoryContext } from "../../context/inventory";

const UpdateInventory = ({ handleClose }: IUpdateInventory) => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { currentInventory } = useContext(InventoryContext)
    const { } = InventoryUtills()
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
    }, [reset]);

    const onSubmit = async (formData: IInventory) => {
        setSendingRequest(true);
        console.log(formData, "Form Data!!")
        setSendingRequest(false);
    }
    return (
        <Grid container xs={12}>
            <Grid item xs={12}>
                <form
                    style={{ width: "100%" }}
                    autoComplete="off"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <InventoryForm
                        handleClose={handleClose}
                        buttonText="Submit"
                        formState={formState}
                        control={control}
                        sendingRequest={sendingRequest}
                        register={register}
                    />
                </form>
            </Grid>
        </Grid>
    )
}

export default UpdateInventory