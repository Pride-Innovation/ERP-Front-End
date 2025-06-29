/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    useContext,
    useEffect,
    useState
} from "react";
import { Paper, Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import { IInventory } from "./interface";
import { InventoryContext } from "../../context/inventory";
import InventoryForm from "./InventoryForm";

const UpdateInventory = () => {
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
        // resolver: yupResolver(inventorySchema),
    });

    useEffect(() => {
        reset({ ...currentInventory });
    }, [reset, currentInventory]);

    const onSubmit = async (formData: IInventory) => {
        setSendingRequest(true);
        console.log(formData, "Submitted Inventory Data");
        setSendingRequest(false)
    };

    return (
        <Paper elevation={3} sx={{ borderRadius: 3, boxShadow: "none", maxWidth: "1300px", mx: "auto", p: 6 }}>
            <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <InventoryForm
                            handleClose={() => { }}
                            buttonText="Submit"
                            formState={formState}
                            control={control}
                            sendingRequest={sendingRequest}
                            register={register}
                        />
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default UpdateInventory;
