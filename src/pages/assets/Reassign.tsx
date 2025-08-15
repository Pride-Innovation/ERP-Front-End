/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

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
import { IReassign } from "./interface";
import { 
  Assignment as AssetIcon, 
  Person as PersonIcon,
  Fingerprint as FingerprintIcon,
  SwapHoriz as SwapIcon
} from '@mui/icons-material';
import { crudStates } from "../../utils/constants";
import { useState } from "react";
import { IOptions } from "../../components/tables/interface";
import CircularProgress from '@mui/material/CircularProgress';

const Reassign = ({
    handleClose,
    sendingRequest,
    handleClickAction,
    buttonText,
    asset
}: IReassign) => {
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [optionsObject, setOptionsObject] = useState<{
        usersOptions: Array<IOptions>;
    }>({ usersOptions: [] });
    const [selectedUser, setSelectedUser] = useState<IOptions | null>(null);

    const handleOpen = () => {
        setOpen(true);
        (async () => {
            setLoading(true);
            // await fetchAllUsers();
            console.log("Fetching Users...");
            setLoading(false);
        })();
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
                    {/* Asset Information Section */}
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
                    
                    {/* User Selection Section */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.primary" fontWeight={600} sx={{ mb: 1.5 }}>
                            Select New User
                        </Typography>
                        
                        <Autocomplete
                            open={open}
                            onOpen={handleOpen}
                            onClose={() => setOpen(false)} // Fixed to not close the whole modal
                            isOptionEqualToValue={(option, value) => option.value === value.value}
                            getOptionLabel={(option) => option.label as string}
                            options={optionsObject.usersOptions}
                            value={selectedUser}
                            onChange={(_, value) => {
                                setSelectedUser(value);
                            }}
                            loading={loading}
                            fullWidth
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
                                                {loading ? <CircularProgress color="primary" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                        />
                    </Grid>
                </Grid>
                
                {/* Action Buttons */}
                <Divider sx={{ my: 3 }} />
                
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Stack direction="row" spacing={2}>
                        <ButtonComponent
                            handleClick={handleClose}
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
                            handleClick={() => handleClickAction?.(crudStates.delete, asset?.id as string)}
                            buttonText={buttonText}
                            // disabled={!selectedUser}
                        />
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
}

export default Reassign;