/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { IITEquipment, IITEquipmentAxiosResponse } from "./interface";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ITEquipmentSchema } from "./schema";
import { Card, Grid, SelectChangeEvent } from "@mui/material";
import { FormHeader } from "../../../components/headers/TypographyComponent";
import ITEquipmentForm from "./ITEquipmentForm";
import { itEquipmentMock } from "../../../mocks/itEquipment";
import { getITEquipmentByIDService } from "./service";
import Loading from "../../../components/loading";

const UpdateITEquipment = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { id } = useParams<{ id: string }>();
    const [defaultAsset, setDefaultAsset] = useState<any>(itEquipmentMock[0]);
    const [option, setOption] = useState<string | undefined>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [params, setParams] = useState<Record<string, any>>();

    const findITEquipmentByID = async () => {
        setLoading(true);
        const response = await getITEquipmentByIDService(id as string) as IITEquipmentAxiosResponse;

        if (response.status === 200) {

            setParams({
                branchName: response.data.branch?.name,
                assignedToFirstName: response.data.assignedTo?.firstName,
                lpoNumber: response.data.stock?.lpoNumber,
                supplierName: response.data.supplier?.name
            })

            setDefaultAsset({
                ...response.data,
                supplier: response.data.supplier?.id,
                assignedTo: response.data.assignedTo?.id,
                branch: response.data.branch?.id,
                assetStatus: response.data.assetStatus?.id,
                assetType: response.data.assetType?.id,
                category: response.data.commodity?.id,
                engravedNumber: response.data.engravedNumber ? response.data.engravedNumber : "",
                unitOfMeasure: response.data.unitOfMeasure ? response.data.unitOfMeasure : "",
                netValueB: response.data.netValueB ? response.data.netValueB : "",
                assetDepreciationRate: response.data.assetDepreciationRate ? response.data.assetDepreciationRate : "",
                hostname: response.data.hostname ? response.data.hostname : "",
                detailNetBookValue: response.data.detailNetBookValue ? response.data.detailNetBookValue : "",
                make: response.data.make ? response.data.make : "",
                model: response.data.model ? response.data.model : "",
                serialNumber: response.data.serialNumber ? response.data.serialNumber : "",
                lpoNumber: response.data.stock?.lpoNumber
            })
        }
        setLoading(false)
    }

    useEffect(() => { findITEquipmentByID(); }, [id]);

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<IITEquipment>({
        mode: 'onChange',
        resolver: yupResolver(ITEquipmentSchema),
    });

    useEffect(() => {
        reset({ ...defaultAsset });
        setOption(defaultAsset.category as string)
    }, [defaultAsset]);

    const onSubmit = async (formData: IITEquipment) => {
        setSendingRequest(true);
        console.log(formData, "Form Data!!")
        setSendingRequest(false)
    };

    const handleChange = (event: SelectChangeEvent) => {
        setOption(event.target.value as string);
    };

    return (
        <Card sx={{ p: 4 }}>
            <Grid container xs={12}>
                <Grid item xs={12}>
                    <FormHeader header="Update Asset" />
                    {loading ? <Loading items='IT Equipment' /> :
                        (<form
                            style={{ width: "100%" }}
                            autoComplete="off"
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <ITEquipmentForm
                                option={option}
                                handleChange={handleChange}
                                buttonText="Submit"
                                formState={formState}
                                control={control}
                                sendingRequest={sendingRequest}
                                register={register}
                                lpoParams={{ lpoNumber: params?.lpoNumber }}
                                userParams={{ firstName: params?.assignedToFirstName }}
                                supplierParams={{ name: params?.supplierName }}
                                branchParams={{ name: params?.branchName }}
                            />
                        </form>)}
                </Grid>
            </Grid>
        </Card>
    )
}

export default UpdateITEquipment;