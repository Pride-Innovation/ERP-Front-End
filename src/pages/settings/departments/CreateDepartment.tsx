/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useForm } from "react-hook-form";
import { ICreateDepartment, IDepartment, IDepartmentAxiosResponse } from "./interface";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMemo } from "react";
import DepartmentUtills from "./utills";
import { toast } from "react-toastify";
import { Grid, Paper } from "@mui/material";
import DepartmentForm from "./DepartmentForm";
import { departmentSchema } from "./schema";
import { createDepartmentService } from "./service";

const CreateDepartment = ({
    handleClose,
    sendingRequest,
    setSendingRequest
}: ICreateDepartment) => {
    // Memoize default values to prevent recreation
    const defaultDepartment = useMemo<IDepartment>(() => ({
        name: '',
        headOfDepartment: null,
        branch: null,
        managersGroupEmail: null,
    } as IDepartment), []);

    const { addDepartmentToStore } = DepartmentUtills();

    const {
        control,
        handleSubmit,
        formState,
        register,
    } = useForm<IDepartment>({
        mode: 'onChange',
        resolver: yupResolver(departmentSchema) as any,
        defaultValues: defaultDepartment, // Use defaultValues instead of reset in useEffect
    });

    const onSubmit = async (formData: IDepartment) => {
        setSendingRequest(true);
        try {
            const response = await createDepartmentService(formData) as IDepartmentAxiosResponse;
            if (response.status === 201) {
                toast.success("Department created successfully");
                addDepartmentToStore(response.data);
                handleClose();
            }
        } catch (error) {
            console.error('Error creating department:', error);
            toast.error("Failed to create department");
        } finally {
            setSendingRequest(false);
        }
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
    );
};

export default CreateDepartment;