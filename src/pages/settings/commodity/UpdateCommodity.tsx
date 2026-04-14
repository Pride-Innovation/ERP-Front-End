// UpdateCommodity.tsx
/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

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
        });
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
                updateCommodityInStore(response.data);
                toast.success("Commodity updated successfully", { position: 'bottom-right' });
            }
        } catch (error) {
            console.error("Error updating commodity:", error);
            toast.error("Failed to update commodity. Please try again.", { position: 'bottom-right' });
        }
        setSendingRequest(false);
        handleClose();
    };

    return (
        <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            <CommodityForm
                handleClose={handleClose}
                buttonText="Update Commodity"
                formState={formState}
                control={control}
                sendingRequest={sendingRequest}
                register={register}
                update={true}
            />
        </form>
    );
};

export default UpdateCommodity;