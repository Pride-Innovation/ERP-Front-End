/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Grid, Paper } from "@mui/material"
import { useEffect, useState } from "react";
import { ICommodity, ICommodityAxiosResponse, IUpdateCommodity } from "./interface";
import CommodityUtills from "./utills";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { commoditySchema } from "./schema";
import { updateCommodityService } from "./service";
import { toast } from "react-toastify";
import CommodityForm from "./CommodityForm";

const UpdateCommodity = ({ handleClose, sendingRequest, setSendingRequest, commodity }: IUpdateCommodity) => {
    const [defaultCommodity, setDefaultCommodity] = useState<any>(commodity);
    const { updateCommodityInStore } = CommodityUtills();

    useEffect(() => {
        setDefaultCommodity({
            ...commodity,
            assetType: commodity.assetType?.id
        })
    }, [commodity]);

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<ICommodity>({
        mode: 'onChange',
        resolver: yupResolver(commoditySchema),
    });

    useEffect(() => {
        reset({ ...defaultCommodity });
    }, [defaultCommodity]);

    const onSubmit = async (formData: ICommodity) => {
        setSendingRequest(true);
        try {
            const response = await updateCommodityService(formData, commodity?.id as number) as ICommodityAxiosResponse;
            if (response.status === 201) {
                console.log(response.data, "Response data!!!")
                updateCommodityInStore(response.data)
                toast.success("Commodity updated successfully")
            }
        } catch (error) {
            console.log(error)
        }
        setSendingRequest(false);
        handleClose()
    };

    return (
        <Paper elevation={3} sx={{ borderRadius: 3, boxShadow: "none", maxWidth: "1200px", mx: "auto" }}>
            <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <CommodityForm
                            handleClose={handleClose}
                            buttonText="Update"
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

export default UpdateCommodity