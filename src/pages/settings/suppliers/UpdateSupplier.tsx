// UpdateSupplier.tsx
/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { ISupplierAxiosResponse, ISupplierFormValues, IUpdateSupplier } from "./interface";
import SupplierForm from "./SupplierForm";
import SupplierUtills from "./Utills";
import { yupResolver } from "@hookform/resolvers/yup";
import { supplierSchema } from "./schema";
import { updateSupplierService } from "./service";
import { toast } from "react-toastify";

const UpdateSupplier = ({ handleClose, sendingRequest, supplier, setSendingRequest }: IUpdateSupplier) => {
    const [defaultSupplier, setDefaultSupplier] = useState<any>(supplier);
    const { updateSupplierInStore } = SupplierUtills();

    useEffect(() => {
        setDefaultSupplier({
            ...supplier,
            commodities: supplier.commodities?.map(c => typeof c === 'object' ? c.id : c) || [],
        });
    }, [supplier]);

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<ISupplierFormValues>({
        mode: 'onChange',
        resolver: yupResolver(supplierSchema),
    });

    useEffect(() => {
        reset({ ...defaultSupplier });
    }, [defaultSupplier]);

    const onSubmit = async (formData: ISupplierFormValues) => {
        setSendingRequest(true);
        try {
            const response = await updateSupplierService(formData, supplier.id as number) as ISupplierAxiosResponse;
            if (response.status === 200) {
                toast.success("Supplier updated successfully", { position: 'bottom-right' });
                updateSupplierInStore(response.data);
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
                toast.error("Failed to update supplier. Please try again.", { position: 'bottom-right' });
            }
        }
        setSendingRequest(false);
    };

    return (
        <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
            <SupplierForm
                handleClose={handleClose}
                buttonText="Update Supplier"
                formState={formState}
                control={control}
                sendingRequest={sendingRequest}
                register={register}
                update={true}
            />
        </form>
    );
};

export default UpdateSupplier;