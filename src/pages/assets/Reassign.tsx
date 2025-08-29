import {
    Box,
    Card,
    CardContent,
    Divider,
    Grid,
    Stack,
    Typography,
    Autocomplete,
    TextField,
    alpha,
    Paper,
    useTheme
} from "@mui/material";
import ButtonComponent from "../../components/forms/Button";
import { IAssetAxiosResponse, IReassign } from "./interface";
import {
    Assignment as AssetIcon,
    Person as PersonIcon,
    Fingerprint as FingerprintIcon,
    SwapHoriz as SwapIcon
} from '@mui/icons-material';
import { useEffect, useState } from "react";
import { IOptions } from "../../components/tables/interface";
import CircularProgress from '@mui/material/CircularProgress';
import { useDebounce } from "../../hooks/useDebounce";
import { AppDispatch, RootState } from "../../store";
import { useSelector } from "react-redux";
import UserUtils from "../users/utils";
import { searchUserService } from "../users/service";
import { IUsersAxiosResponse } from "../users/interface";
import { useDispatch } from "react-redux";
import { loadUsers } from "../users/slice";
import { reassignITEquipmentService } from "./ITEquipment/service";
import { updateITAsset } from "./ITEquipment/slice";
import { toast } from "react-toastify";
import { assetTypesStatusConstants } from "../../utils/constants";
import { reassignOfficeEquipmentService } from "./officeEquipment/service";
import { updateOfficeAsset } from "./officeEquipment/slice";

const Reassign = ({
    handleClose,
    sendingRequest,
    buttonText,
    asset,
    module
}: IReassign) => {
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [optionsObject, setOptionsObject] = useState<{ usersOptions: Array<IOptions> }>({
        usersOptions: []
    });
    const [selectedUser, setSelectedUser] = useState<IOptions | null>(null);
    const { users } = useSelector((state: RootState) => state.UserStore);
    const { fetchAllUsers } = UserUtils();
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
                await fetchAllUsers();
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

    const handleCancel = () => {
        handleClose();
    };


    const reassignAsset = async () => {
        try {
            const response = module === assetTypesStatusConstants.itEquipment
                ? await reassignITEquipmentService(
                    asset?.id as number,
                    { assignedTo: selectedUser?.value }
                ) as IAssetAxiosResponse
                : await reassignOfficeEquipmentService(
                    asset?.id as number,
                    { assignedTo: selectedUser?.value }
                ) as IAssetAxiosResponse;

            if (response.status === 201) {
                toast.success("Asset reassigned successfully");
                module === assetTypesStatusConstants.itEquipment
                    ? dispatch(updateITAsset(response.data))
                    : dispatch(updateOfficeAsset(response.data));
            }
        } catch (error) {
            console.error("Error reassigning asset:", error);
        } finally {
            handleClose();
        }
    };

    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
        >
            <Box
                sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    py: 1.5,
                    px: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}
            >
                <SwapIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={600} color="primary.main">
                    Asset Reassignment
                </Typography>
            </Box>

            <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2.5,
                                borderRadius: 1.5,
                                bgcolor: alpha(theme.palette.primary.main, 0.03),
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                                mb: 3
                            }}
                        >
                            <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 2 }}>
                                You're about to reassign the following asset to another user:
                            </Typography>

                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box
                                        sx={{
                                            bgcolor: theme.palette.primary.main,
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            p: 0.8,
                                            borderRadius: 1,
                                            boxShadow: `0 3px 6px ${alpha(theme.palette.primary.main, 0.25)}`
                                        }}
                                    >
                                        <AssetIcon fontSize="small" />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                            Asset Name
                                        </Typography>
                                        <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                                            {asset.assetName}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box
                                        sx={{
                                            bgcolor: alpha(theme.palette.grey[500], 0.1),
                                            color: theme.palette.grey[600],
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            p: 0.8,
                                            borderRadius: 1
                                        }}
                                    >
                                        <FingerprintIcon fontSize="small" />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                            Engraved Number
                                        </Typography>
                                        {asset.engravedNumber ? (
                                            <Typography variant="subtitle1" fontWeight={500} color="text.primary">
                                                {asset.engravedNumber}
                                            </Typography>
                                        ) : (
                                            <Typography variant="body2" fontStyle="italic" color="text.disabled">
                                                Not specified
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>

                                {asset.assignedTo && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box
                                            sx={{
                                                bgcolor: alpha(theme.palette.info.main, 0.1),
                                                color: theme.palette.info.main,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                p: 0.8,
                                                borderRadius: 1
                                            }}
                                        >
                                            <PersonIcon fontSize="small" />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                                Currently Assigned To
                                            </Typography>
                                            <Typography variant="subtitle1" fontWeight={500} color="text.primary">
                                                {asset.assignedTo?.firstName} {asset.assignedTo?.lastName}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                            </Stack>
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.primary" fontWeight={600} sx={{ mb: 1.5 }}>
                            Select New User
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
                            onChange={(_, value) => {
                                setSelectedUser(value);
                            }}
                            loading={loading || searchLoading}
                            fullWidth
                            noOptionsText="No users found"
                            loadingText="Searching users..."
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1.5,
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: theme.palette.primary.main,
                                        borderWidth: '1px',
                                    },
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select User to Reassign Asset"
                                    placeholder="Search by name, email, or employee ID"
                                    variant="outlined"
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <PersonIcon color="action" sx={{ ml: 1, mr: 0.5 }} />
                                        ),
                                        endAdornment: (
                                            <>
                                                {(loading || searchLoading) ? <CircularProgress color="primary" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                // helperText={localInput ? "Searching after 5 seconds of typing..." : null}
                                />
                            )}
                        />
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Stack direction="row" spacing={2}>
                        <ButtonComponent
                            handleClick={handleCancel}
                            buttonColor='info'
                            type='button'
                            variant="outlined"
                            sendingRequest={false}
                            buttonText="Cancel"
                        />
                        <ButtonComponent
                            buttonColor='primary'
                            type='submit'
                            sendingRequest={sendingRequest}
                            handleClick={reassignAsset}
                            buttonText={buttonText}
                        />
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
}

export default Reassign;