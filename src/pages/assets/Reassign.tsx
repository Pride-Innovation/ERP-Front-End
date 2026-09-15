/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Autocomplete,
    Box,
    CircularProgress,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { IAssetAxiosResponse, IReassign } from "./interface";
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import PersonIcon from '@mui/icons-material/Person';
import { useEffect, useState } from "react";
import { IOptions } from "../../components/tables/interface";
import { useDebounce } from "../../hooks/useDebounce";
import { AppDispatch, RootState } from "../../store";
import { useSelector, useDispatch } from "react-redux";
import UserUtils from "../users/utils";
import { searchUserService } from "../users/service";
import { IUsersAxiosResponse } from "../users/interface";
import { loadUsers } from "../users/slice";
import { toast } from "react-toastify";
import axiosInstance from "../../core/apis/axiosInstance";
import { updateGeneralAssetInStore } from "./general/slice";
import { fieldSx } from "../../components/forms/Inputs";
import ActionModalShell, { ActionPoints, AssetIdentityCard } from "./ActionModalShell";

const Reassign = ({
    handleClose,
    sendingRequest,
    buttonText,
    asset,
}: IReassign) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [optionsObject, setOptionsObject] = useState<{ usersOptions: Array<IOptions> }>({
        usersOptions: []
    });
    const [selectedUser, setSelectedUser] = useState<IOptions | null>(null);
    const { users } = useSelector((state: RootState) => state.UserStore);
    const { fetchStaffOptions } = UserUtils();
    const dispatch = useDispatch<AppDispatch>();

    const [localInput, setLocalInput] = useState<string>('');
    const debouncedInput = useDebounce(localInput, 500);

    useEffect(() => {
        if (users.length > 0)
            setOptionsObject({
                usersOptions: users?.map(user => ({ label: `${user.firstName} ${user.lastName}` as string, value: user.id as number })) || [],
            })

    }, [users])

    const handleOpen = async () => {
        setOpen(true);

        if (optionsObject.usersOptions.length === 0) {
            try {
                setLoading(true);
                await fetchStaffOptions();
            } catch (error) {
                console.error("Error fetching initial users:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const searchUserServiceFunction = async (query: string) => {
        try {
            const response = await searchUserService(query) as IUsersAxiosResponse;
            if (response.status === 200 && response.data) {
                dispatch(loadUsers(response.data.content));
            }

        } catch (error) {
            console.error("Error searching users:", error);
        } finally {
            setSearchLoading(false);
        }
    };

    useEffect(() => {

        if (debouncedInput.trim()) {
            try {
                setSearchLoading(true);
                searchUserServiceFunction(debouncedInput);
            } catch (error) {
                console.error("Error searching users:", error);
            } finally {
                setSearchLoading(false);
            }
        }

    }, [debouncedInput]);

    const reassignAsset = async () => {
        setSaving(true);
        try {
            // The legacy per-category reassign services all hit the same
            // `assets/reassign/{id}` endpoint — call it directly.
            const response = await axiosInstance.post(
                `assets/reassign/${asset?.id}`,
                { assignedTo: selectedUser?.value }
            ) as IAssetAxiosResponse;

            if (response.status === 201) {
                toast.success("Asset reassigned successfully");
                dispatch(updateGeneralAssetInStore(response.data));
            }
        } catch (error) {
            console.error("Error reassigning asset:", error);
        } finally {
            setSaving(false);
            handleClose();
        }
    };

    return (
        <ActionModalShell
            tone="primary"
            icon={<SwapHorizIcon />}
            title="Reassign Asset"
            subtitle="Transfer this asset to another staff member"
            onCancel={handleClose}
            onConfirm={reassignAsset}
            confirmText={buttonText}
            confirmIcon={<SwapHorizIcon />}
            busy={sendingRequest || saving}
            busyText="Reassigning..."
            confirmDisabled={!selectedUser}
        >
            <Stack spacing={3}>
                <Box>
                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                        You're about to hand this asset to another user. This action:
                    </Typography>
                    <ActionPoints
                        points={[
                            'Closes the current assignment and opens one for the new holder',
                            'Is recorded in the asset\'s assignment history',
                            'Does not change the asset\'s branch or condition',
                        ]}
                    />
                </Box>

                <AssetIdentityCard asset={asset} />

                <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.75 }}>
                        New Holder
                    </Typography>
                    <Autocomplete
                        open={open}
                        onOpen={handleOpen}
                        onClose={() => setOpen(false)}
                        isOptionEqualToValue={(option, value) => option.value === value.value}
                        getOptionLabel={(option) => option.label as string}
                        options={optionsObject.usersOptions}
                        value={selectedUser}
                        onInputChange={(_, newInputValue) => setLocalInput(newInputValue)}
                        onChange={(_, value) => setSelectedUser(value)}
                        loading={loading || searchLoading}
                        fullWidth
                        noOptionsText="No users found"
                        loadingText="Searching users..."
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                size="medium"
                                placeholder="Search by name, email, or employee ID"
                                helperText="The asset will show as held by this person once reassigned"
                                sx={fieldSx}
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <PersonIcon color="action" sx={{ ml: 1, mr: 0.5 }} fontSize="small" />
                                    ),
                                    endAdornment: (
                                        <>
                                            {(loading || searchLoading) ? <CircularProgress color="primary" size={18} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                    />
                </Box>
            </Stack>
        </ActionModalShell>
    );
}

export default Reassign;
