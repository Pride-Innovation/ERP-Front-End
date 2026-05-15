/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useForm } from "react-hook-form";
import { ICreateRegion, IRegionAxiosResponse, IRegionFormValues } from "./interface";
import { yupResolver } from "@hookform/resolvers/yup";
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
    const { addRegionToStore } = RegionUtills();

    const {
        control,
        handleSubmit,
        formState,
        register,
    } = useForm<IRegionFormValues>({
        mode: 'onChange',
        resolver: yupResolver(regionSchema),
        defaultValues: { name: '' },
    });

    const onSubmit = async (formData: IRegionFormValues) => {
        setSendingRequest(true);
        try {
            const response = await createRegionService({ name: formData.name }) as IRegionAxiosResponse;
            if (response.status === 201) {
                addRegionToStore(response.data);
                toast.success("Region created successfully", { position: 'bottom-right' });
                handleClose();
            }
        } catch (error: any) {
            const detail = error?.response?.data?.detail;
            const properties = error?.response?.data?.properties;
            const message = error?.response?.data?.message;
            if (properties?.name) {
                toast.error(properties.name, { position: 'bottom-right' });
            } else if (properties) {
                toast.error(Object.values(properties).join(', '), { position: 'bottom-right' });
            } else if (detail) {
                toast.error(detail, { position: 'bottom-right' });
            } else if (message) {
                toast.error(message, { position: 'bottom-right' });
            } else {
                toast.error("Failed to create region. Please try again.", { position: 'bottom-right' });
            }
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