/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Card, Grid } from "@mui/material";
import { FormHeader } from "../../../components/headers/TypographyComponent";
import { IFleet, IFleetAxiosResponse } from "./interface";
import { fleetsMock } from "../../../mocks/fleet";
import { fleetSchema } from "./schema";
import FleetForm from "./FleetForm";
import { getFleetEquipmentByIDService, updateFleetEquipmentService } from "./service";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store";
import Loading from "../../../components/loading";
import { toast } from "react-toastify";
import { updateFleetAsset } from "./slice";

const UpdateFleet = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { id } = useParams<{ id: string }>();
    const [defaultAsset, setDefaultAsset] = useState<any>(fleetsMock[0]);
    const [params, setParams] = useState<Record<string, any>>();
    const [loading, setLoading] = useState<boolean>(false);
    const dispatch = useDispatch<AppDispatch>();

    const findFleetEquipmentByID = async () => {
        setLoading(true)
        const response = await getFleetEquipmentByIDService(id as string) as IFleetAxiosResponse;

        if (response.status === 200) {
            setParams({
                branchName: response.data.branch?.name,
                assignedToFirstName: response.data.assignedTo?.firstName,
                lpoNumber: response.data.stock?.lpoNumber,
                supplierName: response.data.supplier?.name
            });

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
                lpoNumber: response.data.stock?.lpoNumber
            })
        }
        setLoading(false)
    }

    useEffect(() => { findFleetEquipmentByID() }, [id]);

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<IFleet>({
        mode: 'onChange',
        resolver: yupResolver(fleetSchema),
    });

    useEffect(() => {
        reset({ ...defaultAsset });
    }, [defaultAsset]);

    const onSubmit = async (formData: IFleet) => {
        setSendingRequest(true);
        try {
            const response = await updateFleetEquipmentService(formData, id as string) as IFleetAxiosResponse
            if (response.status === 201) {
                toast.success("Asset Updated Successfully")
                dispatch(updateFleetAsset(response.data))
            }
        } catch (error) {
            console.log(error)
        }
        setSendingRequest(false)
    };

    return (
        <Card sx={{ p: 4 }}>
            <Grid container xs={12}>
                <Grid item xs={12}>
                    <FormHeader header="Update Asset" />
                    {loading ? <Loading items='Fleet Equipment' /> :
                        (<form
                            style={{ width: "100%" }}
                            autoComplete="off"
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <FleetForm
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
                        </form>)
                    }
                </Grid>
            </Grid>
        </Card>
    )
}

export default UpdateFleet