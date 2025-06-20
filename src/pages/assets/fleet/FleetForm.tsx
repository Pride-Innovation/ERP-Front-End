/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useNavigate } from "react-router";
import { IFleetForm } from "./interface";
import {
    Box,
    Divider,
    Grid,
    Stack
} from "@mui/material";
import {
    UseFormAutocompleteComponent,
    UseFormDatePicker,
    UseFormInput,
    UseFormSelect
} from "../../../components/forms";
import ButtonComponent from "../../../components/forms/Button";
import { ROUTES } from "../../../core/routes/routes";
import FleetUtills from "./utills";
import BranchUtills from "../../settings/branch/utills";
import StatusUtills from "../../settings/statuses/Utills";
import UserUtils from "../../users/utils";
import AssetTypeUtills from "../../settings/assetTypes/utills";
import SupplierUtills from "../../settings/suppliers/Utills";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import CommodityUtills from "../../settings/commodity/utills";
import InventoryUtills from "../../inventory/Utills";

const FleetForm = ({
    formState,
    control,
    register,
    buttonText,
    sendingRequest,
}: IFleetForm) => {
    const navigate = useNavigate();
    const [assetTypeId, setAssetTypeId] = useState<number | null>()
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);

    const { formFields, determineFleetAssetType } = FleetUtills();
    const { fetchAllBranches } = BranchUtills();
    const { fetchAllStatuses } = StatusUtills();
    const { fetchAllUsers } = UserUtils();
    const { fetchAllAssetTypes } = AssetTypeUtills()
    const { fetchAllSuppliers } = SupplierUtills();
    const { fetchAllCommodities } = CommodityUtills()
    const { fetchInventory } = InventoryUtills()

    useEffect(() => { fetchAllBranches() }, []);
    useEffect(() => { fetchAllStatuses() }, []);
    useEffect(() => { fetchAllUsers() }, []);
    useEffect(() => { fetchAllAssetTypes() }, []);
    useEffect(() => { fetchAllSuppliers() }, []);
    useEffect(() => { fetchInventory() }, []);

    useEffect(() => {
        if (assetTypes.length > 0) {
            const assetType = determineFleetAssetType();
            if (assetType !== null) {
                setAssetTypeId(assetType.id as number)
            }
        }
    }, [assetTypes]);

    useEffect(() => {
        if (assetTypeId) {
            fetchAllCommodities({ assetTypeId })
        }
    }, [assetTypeId]);

    return (
        <Box sx={{ width: "100%" }}>
            <Grid container spacing={3}>
                {formFields.map((field) => {
                    const commonProps = {
                        register,
                        control,
                        formState,
                        value: field.value,
                        label: field.label,
                        required: field.required === false ? field.required : true
                    };

                    const gridSize = field.type === "textarea" ? 12 : 3;

                    return (
                        <Grid item xs={12} md={gridSize} key={field.value}>
                            {field.type === "input" && <UseFormInput {...commonProps} />}
                            {field.type === "textarea" && <UseFormInput {...commonProps} multiline row={4} />}
                            {field.type === "number" && <UseFormInput {...commonProps} type="number" />}
                            {field.type === "select" && (
                                <UseFormSelect {...commonProps} options={field.options} />
                            )}
                            {field.type === "date" && <UseFormDatePicker {...commonProps} />}
                            {field.type === "autocomplete" && (
                                <UseFormAutocompleteComponent {...commonProps} options={field.options} />
                            )}
                        </Grid>
                    );
                })}

                <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        justifyContent="space-between"
                        alignItems={{ xs: "stretch", sm: "center" }}
                    >
                        <Stack direction="row" spacing={2}>
                            < ButtonComponent handleClick={() => navigate(ROUTES.LIST_OFFICE_EQUIPMENT)} buttonColor='error' type='button' sendingRequest={false} buttonText="Back" />
                            <ButtonComponent buttonColor='success' type='submit' sendingRequest={sendingRequest} buttonText={buttonText} />
                        </Stack>
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    )
}

export default FleetForm