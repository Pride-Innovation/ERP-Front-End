/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useForm } from "react-hook-form";
import { ICreateRegion, IRegion, IRegionAxiosResponse } from "./interface";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMemo } from "react";
import RegionUtills from "./utills";
import { toast } from "react-toastify";
import { createRegionService } from "./service";
import RegionForm from "./RegionForm";
import { regionSchema } from "./schema";

const CreateRegion = ({
    handleClose,
    sendingRequest,
    setSendingRequest
}: ICreateRegion) => {
    const defaultRegion = useMemo<IRegion>(() => ({
        name: '',
    } as IRegion), []);

    const { addRegionToStore } = RegionUtills();

    const {
        control,
        handleSubmit,
        formState,
        register,
    } = useForm<IRegion>({
        mode: 'onChange',
        resolver: yupResolver(regionSchema) as any,
        defaultValues: defaultRegion,
    });

    const onSubmit = async (formData: IRegion) => {
        setSendingRequest(true);
        try {
            const response = await createRegionService(formData) as IRegionAxiosResponse;
            if (response.status === 201) {
                toast.success("Region created successfully");
                addRegionToStore(response.data);
                handleClose();
            }
        } catch (error) {
            console.error('Error creating region:', error);
            toast.error("Failed to create region");
        } finally {
            setSendingRequest(false);
        }
    };

    return (
        <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            <RegionForm
                handleClose={handleClose}
                buttonText="Submit"
                formState={formState}
                control={control}
                sendingRequest={sendingRequest}
                register={register}
            />
        </form>
    );
};

export default CreateRegion;