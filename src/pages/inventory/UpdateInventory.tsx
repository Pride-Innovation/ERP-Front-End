/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    useContext,
    useEffect,
    useState
} from "react";
import { Paper, Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import { IInventory, IInventoryAxiosResponse } from "./interface";
import InventoryForm from "./InventoryForm";
import { useParams } from "react-router";
import { completeDeliveryService, fetchInventoryByIDService } from "./service";
import { inventoryMock } from "../../mocks/inventory";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { ICommodity } from "../settings/commodity/interface";
import { StockRowData } from "../../components/forms/interface";
import { RequestContext } from "../../context/request/RequestContext";
import CommodityUtills from "../settings/commodity/utills";
import { cleanNewDeliveries, generateReferenceNumber, validatePartialDeliveries } from "../../utils/helpers";
import { toast } from "react-toastify";

const UpdateInventory = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const [defaultInventory, setDefaultInventory] = useState<any>(inventoryMock[0]);
    const { commodities } = useSelector((state: RootState) => state.CommodityStore);
    const { id } = useParams<{ id: string }>();
    const { setStockRows, stockRows } = useContext(RequestContext);
    const { fetchAllCommodities } = CommodityUtills();


    useEffect(() => { fetchAllCommodities() }, []);


    const fetchInventory = async () => {
        try {
            const response = await fetchInventoryByIDService(id as string) as IInventoryAxiosResponse;
            if (response.status === 200) {
                const { data } = response;
                setDefaultInventory({
                    ...data,
                    supplier: data.supplier?.id
                })
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => { fetchInventory() }, [id])


    const handleRows = () => {
        if (defaultInventory?.commodities
            && commodities?.length > 0) {
            const rowData = (defaultInventory.commodities as Array<{
                commodity: ICommodity,
                orderedQuantity: number,
                deliveredQuantity: number,
                costPrice: number,
                purchasePrice: number,
            }>
            ).map((commodity, index) => ({
                id: Date.now() + index,
                assetTypeId: commodity.commodity.assetType?.id,
                name: commodity.commodity.name,
                groupName: commodity.commodity.groupName,
                orderedQuantity: commodity.orderedQuantity,
                deliveredQuantity: commodity.deliveredQuantity,
                commodityId: commodity.commodity.id,
                costPrice: commodity.costPrice,
                purchasePrice: commodity.purchasePrice
            })) as Array<StockRowData>;

            setStockRows(rowData);
        }
    }

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset
    } = useForm<IInventory>({
        mode: 'onChange',
        // resolver: yupResolver(inventorySchema),
    });

    useEffect(() => {
        handleRows()
        reset({ ...defaultInventory });
    }, [defaultInventory]);

    const onSubmit = async (formData: IInventory) => {
        setSendingRequest(true);
        const errors = validatePartialDeliveries(stockRows, formData?.commodities as any);


        if (errors.length > 0) {
            setSendingRequest(false);
            return toast.error(`Requests validation errors: ${errors}`)
        }

        const cleanedCommodities = cleanNewDeliveries(
            formData.commodities ?? [], // fallback to empty array if null/undefined
            stockRows as Array<StockRowData>
        );

        try {
            const data = {
                additionalDeliveries: cleanedCommodities,
                grnNumber: generateReferenceNumber()
            }

            const response = await completeDeliveryService(data, id as string) as IInventoryAxiosResponse;
            if (response.status === 201) {
                toast.success("Inventory updated successfully");
            } else {
                toast.error("Failed to update inventory. Please try again.");
            }
        } catch (error) {
            console.error("Error updating inventory:", error);
            setSendingRequest(false);
            return toast.error("Failed to update inventory. Please try again.");

        }

        setSendingRequest(false)
    };

    return (
        <Paper elevation={3} sx={{ borderRadius: 3, boxShadow: "none", maxWidth: "1300px", mx: "auto", p: 6 }}>
            <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <InventoryForm
                            handleClose={() => { }}
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

export default UpdateInventory;
