/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Grid,
    Paper,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";

import BranchForm from "./BranchForm";
import { IBranch, IBranchAxiosResponse, ICreateBranch } from "./interface";
import { branchSchema } from "./schema";
import { createBranchService } from "./service";
import { IResponseData } from "../../users/interface";
import BranchUtills from "./utills";

const CreateBranch = ({
    handleClose,
    sendingRequest,
    setSendingRequest,
}: ICreateBranch) => {
    const defaultBranch: IBranch = {} as IBranch;
    const { addBranchToStore } = BranchUtills();

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset,
    } = useForm<IBranch>({
        mode: "onChange",
        resolver: yupResolver(branchSchema),
    });

    useEffect(() => {
        reset({ ...defaultBranch });
    }, [reset]);

    const onSubmit = async (formData: IBranch) => {
        setSendingRequest(true);
        try {
            const response = await createBranchService(formData) as IBranchAxiosResponse;
            console.log(response, "Response")
            if (response.status === 201) {
                addBranchToStore(response.data);
                toast.success("Branch created successfully")
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
                        <BranchForm
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
};

export default CreateBranch;
