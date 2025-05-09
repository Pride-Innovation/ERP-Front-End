/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { IBranch, IUpdateBranch } from "./interface";
import { Grid } from "@mui/material";
import BranchForm from "./BranchForm";
import { yupResolver } from "@hookform/resolvers/yup";
import { branchSchema } from "./schema";
import { updateBranchService } from "./service";
import { IResponseData } from "../../users/interface";
import { toast } from "react-toastify";
import BranchUtills from "./Utills";

const UpdateBranch = ({ handleClose, sendingRequest, branch, setSendingRequest }: IUpdateBranch) => {
    const { updateBranchInStore } = BranchUtills()
    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<IBranch>({
        mode: 'onChange',
        resolver: yupResolver(branchSchema),
    });

    useEffect(() => {
        reset({ ...branch });
    }, [reset]);

    const onSubmit = async (formData: IBranch) => {
        setSendingRequest(true);
        const request = {
            ...formData,
            user_id: 1
        }

        const response = await updateBranchService(request, formData?.id as string) as IResponseData;
        if (response.status === 'success') {
            updateBranchInStore(response.data[0] as IBranch)
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
                    <BranchForm
                        update
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

export default UpdateBranch