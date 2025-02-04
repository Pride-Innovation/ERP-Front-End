import { Grid } from "@mui/material"
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

export default CreateInventory