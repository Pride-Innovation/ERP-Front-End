/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { ISupplier, IUpdateSupplier } from "./interface";
import { Grid } from "@mui/material";
import SupplierForm from "./SupplierForm";
import { IResponseData } from "../../users/interface";
import { updateSupplierService } from "./service";
import SupplierUtills from "./Utills";
import { toast } from "react-toastify";
import { yupResolver } from "@hookform/resolvers/yup";
import { supplierSchema } from "./schema";

const UpdateSupplier = ({ handleClose, sendingRequest, supplier, setSendingRequest }: IUpdateSupplier) => {
    const { updateSupplierInStore } = SupplierUtills()
    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<ISupplier>({
        mode: 'onChange',
        resolver: yupResolver(supplierSchema),
    });

    useEffect(() => {
        reset({ ...supplier });
    }, [reset]);

    const onSubmit = async (formData: ISupplier) => {
        setSendingRequest(true);
        const request = {
            ...formData,
            user_id: 1
        }

        const response = await updateSupplierService(request, formData?.id as string) as IResponseData;
        if (response.status === 'success') {
            updateSupplierInStore(response.data[0] as unknown as ISupplier)
            toast.success(response.data.message)
            setSendingRequest(false);
            handleClose()
        }
        setSendingRequest(true);
    };

    return (
        <Grid container xs={12}>
            <Grid item xs={12}>
                <form
                    style={{ width: "100%" }}
                    autoComplete="off"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <SupplierForm
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

export default UpdateSupplier