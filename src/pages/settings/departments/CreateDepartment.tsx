/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useForm } from "react-hook-form";
import { ICreateDepartment, IDepartment, IDepartmentAxiosResponse } from "./interface";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect } from "react";
import DepartmentUtills from "./utills";
import { toast } from "react-toastify";
import { IResponseData } from "../../users/interface";
import { Grid, Paper } from "@mui/material";
import DepartmentForm from "./DepartmentForm";
import { departmentSchema } from "./schema";
import { createDepartmentService } from "./service";

const CreateDepartment = ({
    handleClose,
    sendingRequest,
    setSendingRequest
}: ICreateDepartment) => {
    const defaultSupplier: IDepartment = {} as IDepartment;
    const { addDepartmentToStore } = DepartmentUtills()
    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<IDepartment>({
        mode: 'onChange',
        resolver: yupResolver(departmentSchema),
    });

    useEffect(() => {
        reset({ ...defaultSupplier });
    }, [reset]);

    const onSubmit = async (formData: IDepartment) => {
        setSendingRequest(true)
        try {
            const response = await createDepartmentService(formData) as IDepartmentAxiosResponse;
            if (response.status === 201) {
                toast.success("Department created successfully")
                addDepartmentToStore(response.data)
            }
        } catch (error) {
            console.log(error)
        }
        setSendingRequest(false)
        handleClose()
    };

    return (
        <Paper elevation={3} sx={{ borderRadius: 3, boxShadow: "none", maxWidth: "1200px", mx: "auto" }}>
            <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <DepartmentForm
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
    )
}

export default CreateDepartment