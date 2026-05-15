// CreateCommodity.tsx
/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useForm } from "react-hook-form";
import { ICommodityAxiosResponse, ICommodityFormValues, ICreateCommodity } from "./interface";
import CommodityUtills from "./utills";
import { yupResolver } from "@hookform/resolvers/yup";
import { commoditySchema } from "./schema";
import { useEffect } from "react";
import { toast } from "react-toastify";
import CommodityForm from "./CommodityForm";
import { createCommodityService } from "./service";

const CreateCommodity = ({
    setSendingRequest,
    handleClose,
    sendingRequest
}: ICreateCommodity) => {
    const defaultCommodity: ICommodityFormValues = {} as ICommodityFormValues;
    const { addCommodityToStore } = CommodityUtills();

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset,
    } = useForm<ICommodityFormValues>({
        mode: "onChange",
        resolver: yupResolver(commoditySchema),
    });

    useEffect(() => {
        reset({ ...defaultCommodity });
    }, [reset]);

    const onSubmit = async (formData: ICommodityFormValues) => {
        setSendingRequest(true);
        try {
            const response = await createCommodityService(formData) as ICommodityAxiosResponse;
            if (response.status === 201) {
                addCommodityToStore(response.data);
                toast.success("Commodity created successfully", { position: 'bottom-right' });
                handleClose();
            }
        } catch (error: any) {
            const detail = error?.response?.data?.detail;
            const properties = error?.response?.data?.properties;
            if (properties) {
                const messages = Object.values(properties).join(', ');
                toast.error(messages, { position: 'bottom-right' });
            } else if (detail) {
                toast.error(detail, { position: 'bottom-right' });
            } else {
                toast.error("Failed to create commodity. Please try again.", { position: 'bottom-right' });
            }
        }
        setSendingRequest(false);
    };

    return (
        <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            <CommodityForm
                handleClose={handleClose}
                buttonText="Create Commodity"
                formState={formState}
                control={control}
                sendingRequest={sendingRequest}
                register={register}
            />
        </form>
    );
};

export default CreateCommodity;