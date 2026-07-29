/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { IAssetAxiosResponse, IDispose } from "./interface";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { toast } from "react-toastify";
import axiosInstance from "../../core/apis/axiosInstance";
import { disposeGeneralAssetFromStore } from "./general/slice";
import ActionModalShell, { ActionPoints, AssetIdentityCard } from "./ActionModalShell";

const Dispose = ({
    handleClose,
    sendingRequest,
    buttonText,
    asset,
}: IDispose) => {
    const dispatch = useDispatch<AppDispatch>();
    const [saving, setSaving] = useState(false);

    const handleDisposal = async () => {
        setSaving(true);
        try {
            // The legacy per-category dispose services all POST to the same
            // `assets/{id}` endpoint, so we hit it directly here.
            const response = await axiosInstance.post(`assets/${asset?.id}`) as IAssetAxiosResponse;

            if (response.status === 201) {
                toast.success("Asset disposed successfully");
                // Remove the disposed asset from the unified store (every
                // category lives in GeneralAssetStore now).
                dispatch(disposeGeneralAssetFromStore(asset?.id));
            }
        } catch (error) {
            console.log(error, "Error Message")
        } finally {
            setSaving(false);
            handleClose()
        }
    }

    return (
        <ActionModalShell
            tone="error"
            icon={<DeleteForeverIcon />}
            title="Confirm Asset Disposal"
            subtitle="This permanently retires the asset from the register"
            onCancel={handleClose}
            onConfirm={handleDisposal}
            confirmText={buttonText}
            confirmIcon={<DeleteOutlineIcon />}
            busy={sendingRequest || saving}
            busyText="Disposing..."
        >
            <Stack spacing={3}>
                <Box>
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                        Are you sure you want to dispose of this asset? This action:
                    </Typography>
                    <ActionPoints
                        tone="error"
                        points={[
                            'Marks the asset as disposed and removes it from the active register',
                            'Cannot be undone from this screen',
                            <>Keeps the record in the <strong>audit trail</strong> for historical reporting</>,
                            'Should only be used once the asset has been physically written off',
                        ]}
                    />
                </Box>

                <AssetIdentityCard asset={asset} />
            </Stack>
        </ActionModalShell>
    );
}

export default Dispose;
