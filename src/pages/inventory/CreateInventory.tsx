/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Grid, Paper } from "@mui/material"
import { IInventory, IInventoryAxiosResponse } from "./interface"
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { inventorySchema } from "./schema";
import InventoryForm from "./InventoryForm";
import { RequestContext } from "../../context/request/RequestContext";
import { toast } from "react-toastify";
import { generateReferenceNumber, validateStockItems } from "../../utils/helpers";
import { addStockService } from "./service";

const CreateInventory = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { stockRows, totalCostPrice, totalPurchasePrice } = useContext(RequestContext);
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
        const result = validateStockItems(stockRows);

        if (result.isValid && result.validData) {

            const data = {
                stock: {
                    name: formData.name,
                    referenceNumber: generateReferenceNumber(),
                    totalCost: totalCostPrice,
                    balanceCost: totalPurchasePrice
                },
                status: 1,
                supplier: formData.supplier,
                stockCommoditiesRequest: result.validData
            }

            try {
                const response = await addStockService(data) as IInventoryAxiosResponse;
                if (response.status === 201) {
                    toast.success("Stock created successfully")
                }
            } catch (error) {
                console.log(error)
            }

        } else {
            toast.error(`Requests validation errors: ${result.errors}`)
        }
        setSendingRequest(false);
    }
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
    )
}

export default CreateInventory