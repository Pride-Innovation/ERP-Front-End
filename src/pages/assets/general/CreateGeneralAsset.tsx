import React from 'react';
import { useEffect, useState } from "react";
import { IOfficeEquipment, IOfficeEquipmentAxiosResponse } from "../interface";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
    Box,
    Breadcrumbs,
    Chip,
    Link,
    Stack,
    Typography,
    alpha,
} from "@mui/material";
import { buildOfficeEquipmentSchema } from "./schema";
import OfficeEquipmentForm from "./AssetForm";
import { toast } from "react-toastify";
import { createOfficeEquipmentService } from "./service";
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "../../../core/routes/routes";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";

const PRIMARY_COLOR = '#08796C';

const CreateGeneralAsset = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const { typeId } = useParams<{ typeId: string }>();
    const { assetTypes } = useSelector((state: RootState) => state.AssetTypeStore);
    const assetType = assetTypes.find(t => String(t.id) === typeId);

    const schema = buildOfficeEquipmentSchema(assetType?.fieldConfig);

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset,
        trigger
    } = useForm<IOfficeEquipment>({
        mode: 'onChange',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: yupResolver(schema) as any,
    });

    const navigate = useNavigate();

    /*
     * Which button was pressed, read after the save completes.
     *
     * A ref rather than state on purpose: it is set in the click handler immediately before the form
     * submits, and `onSubmit` reads it in the same tick. State would not have re-rendered in time, so
     * the first "Save and add another" of a session would navigate away — the classic stale-closure
     * version of this pattern, and the reason it is worth saying out loud.
     *
     * Reset after every save so an "add another" followed by a plain "Save" does not keep the user
     * on the form.
     */
    const addAnotherRef = React.useRef(false);

    useEffect(() => {
        reset({ assetType: typeId ? Number(typeId) : undefined } as unknown as IOfficeEquipment);
    }, [reset, typeId]);

    const onSubmit = async (formData: IOfficeEquipment) => {
        setSendingRequest(true);
        try {
            const response = await createOfficeEquipmentService(formData) as IOfficeEquipmentAxiosResponse;

            // 200 or 201, for the same reason the update page accepts both: the status these
            // endpoints answer with should not be the thing that decides whether a save "worked".
            if (response.status === 200 || response.status === 201) {
                toast.success(`${assetType?.name || 'Asset'} created successfully!`);

                /*
                 * Back to the register for the category the asset actually landed in.
                 *
                 * Read from the response first, falling back to the URL. Today they are always the
                 * same — `AssetForm` takes `overrideAssetTypeId` from `typeId` and exposes no category
                 * selector, so a created asset cannot end up anywhere else — but that is a fact about
                 * a field the form does not currently have, not a guarantee. The update page can rely
                 * on `typeId` because it *pins* `assetType` to it in the request; this one does not,
                 * so it asks the server what it created.
                 *
                 * The toast survives the navigation: `ToastContainer` is mounted in `App`, above the
                 * router.
                 *
                 * Returned from here rather than falling through, or `setSendingRequest(false)` below
                 * would set state on a component that is unmounting.
                 */
                if (addAnotherRef.current) {
                    /*
                     * Stay, and clear the form for the next one — the rapid-entry workflow this page
                     * was originally built around, now something the user chooses rather than the
                     * only thing the page does.
                     *
                     * The category is put back deliberately: it is the one field that should survive,
                     * because somebody registering several assets in a row is registering several of
                     * the same kind.
                     */
                    addAnotherRef.current = false;
                    reset({ assetType: typeId ? Number(typeId) : undefined } as unknown as IOfficeEquipment);
                    setSendingRequest(false);
                    return;
                }

                const landedIn = response.data?.assetType?.id ?? (typeId ? Number(typeId) : undefined);
                navigate(`${ROUTES.LIST_GENERAL_ASSETS}/${landedIn}`);
                return;
            }

            toast.error(`Failed to create ${assetType?.name || 'asset'}`);
        } catch (error) {
            console.error("Error creating asset:", error);
            toast.error("Failed to create asset. Please try again.");
        }
        // Cleared on every path that did not act on it, so a failed "add another" does not silently
        // keep the user on the form after they press plain Save next time.
        addAnotherRef.current = false;
        setSendingRequest(false);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2.5,
                width: '100%',
                maxWidth: 1400,
                mx: 'auto',
                px: { xs: 1, sm: 2 },
                py: { xs: 1.5, sm: 2 },
            }}
        >
            {/* ── Page Nav Bar ── */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                        onClick={() => navigate(`${ROUTES.LIST_GENERAL_ASSETS}/${typeId}`)}
                        sx={{
                            display: 'flex', alignItems: 'center', gap: 0.75, cursor: 'pointer',
                            color: alpha(PRIMARY_COLOR, 0.85), px: 1.5, py: 0.6, borderRadius: 1.5,
                            border: `1px solid ${alpha(PRIMARY_COLOR, 0.22)}`, bgcolor: alpha(PRIMARY_COLOR, 0.04),
                            transition: 'all 0.18s ease',
                            '&:hover': { bgcolor: alpha(PRIMARY_COLOR, 0.09), borderColor: alpha(PRIMARY_COLOR, 0.4), color: PRIMARY_COLOR },
                        }}
                    >
                        <ArrowBackIosNewOutlinedIcon sx={{ fontSize: 12 }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'inherit' }}>
                            Back to {assetType?.name || 'Assets'}
                        </Typography>
                    </Box>
                    <Breadcrumbs separator="›" sx={{ '& .MuiBreadcrumbs-separator': { color: alpha('#000', 0.3), mx: 0.5 }, display: { xs: 'none', sm: 'flex' } }}>
                        <Link underline="hover" onClick={() => navigate(ROUTES.ASSETS_MANAGEMENT)}
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.disabled', fontSize: '0.75rem', cursor: 'pointer' }}>
                            <HomeOutlinedIcon sx={{ fontSize: 14 }} />Home
                        </Link>
                        <Link underline="hover" onClick={() => navigate(`${ROUTES.LIST_GENERAL_ASSETS}/${typeId}`)}
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', fontSize: '0.75rem', cursor: 'pointer' }}>
                            <CategoryOutlinedIcon sx={{ fontSize: 14 }} />{assetType?.name || 'Assets'}
                        </Link>
                        <Typography sx={{ fontSize: '0.75rem', color: PRIMARY_COLOR, fontWeight: 600 }}>Create</Typography>
                    </Breadcrumbs>
                </Stack>
                <Chip
                    icon={<AddCircleOutlineIcon sx={{ fontSize: 14 }} />}
                    label={`New ${assetType?.name || 'Asset'}`}
                    size="small"
                    sx={{ height: 26, fontSize: '0.72rem', fontWeight: 600, bgcolor: alpha(PRIMARY_COLOR, 0.08), color: PRIMARY_COLOR, border: `1px solid ${alpha(PRIMARY_COLOR, 0.2)}`, '& .MuiChip-icon': { color: PRIMARY_COLOR } }}
                />
            </Box>

            {/* ── Form ── */}
            <form style={{ width: '100%' }} autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                <OfficeEquipmentForm
                    buttonText={`Save ${assetType?.name || 'Asset'}`}
                    secondaryButtonText="Save & add another"
                    onSecondaryIntent={() => { addAnotherRef.current = true; }}
                    formState={formState}
                    control={control}
                    sendingRequest={sendingRequest}
                    register={register}
                    trigger={trigger}
                    overrideAssetTypeId={typeId ? Number(typeId) : undefined}
                />
            </form>
        </Box>
    );
};

export default CreateGeneralAsset;
