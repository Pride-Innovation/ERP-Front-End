/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useForm } from "react-hook-form";
import { ICommodity, ICommodityAxiosResponse, ICreateCommodity } from "./interface";
import CommodityUtills from "./utills";
import { yupResolver } from "@hookform/resolvers/yup";
import { commoditySchema } from "./schema";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { Grid, Paper } from "@mui/material";
import CommodityForm from "./CommodityForm";
import { createCommodityService } from "./service";

const CreateCommodity = ({
    setSendingRequest,
    handleClose,
    sendingRequest
}: ICreateCommodity) => {
    const defaultCommodity: ICommodity = {} as ICommodity;
    const { addCommodityToStore } = CommodityUtills();

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset,
    } = useForm<ICommodity>({
        mode: "onChange",
        resolver: yupResolver(commoditySchema),
    });

    useEffect(() => {
        reset({ ...defaultCommodity });
    }, [reset]);

    const onSubmit = async (formData: ICommodity) => {
        setSendingRequest(true);
        try {
            const response = await createCommodityService(formData) as ICommodityAxiosResponse;
            if (response.status === 201) {
                addCommodityToStore(response.data);
                toast.success("Commodity created successfully")
            }
        } catch (error) {
            console.log(error);
        }
        setSendingRequest(false);

    };

    return (
        <Paper elevation={3} sx={{ borderRadius: 3, boxShadow: "none", maxWidth: "1200px", mx: "auto" }}>
            <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <CommodityForm
                            handleClose={handleClose}
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
}

export default CreateCommodity