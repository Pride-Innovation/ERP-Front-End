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
    Paper,
    useTheme,
    alpha,
    TextField,
    FormControl,
    InputLabel,
    MenuItem,
    Select
} from "@mui/material";
import ButtonComponent from "../../components/forms/Button";
import { IRepair } from "./interface";
import {
    Assignment as AssetIcon,
    BuildCircle as RepairIcon,
    Fingerprint as FingerprintIcon,
    Engineering as TechnicianIcon
} from '@mui/icons-material';
import { crudStates } from "../../utils/constants";
import { useState } from "react";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';


const Repair = ({
    handleClose,
    sendingRequest,
    handleClickAction,
    buttonText,
    asset
}: IRepair) => {
    const theme = useTheme();
    const [repairDate, setRepairDate] = useState<Dayjs | null>(null);
    const [repairReason, setRepairReason] = useState("");
    const [technician, setTechnician] = useState("");

    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`,
            }}
        >
            <Box
                sx={{
                    bgcolor: alpha(theme.palette.info.main, 0.08),
                    py: 1.5,
                    px: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}
            >
                <RepairIcon color="info" />
                <Typography variant="subtitle1" fontWeight={600} color="info.main">
                    Asset Repair Request
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
                                bgcolor: alpha(theme.palette.background.default, 0.7),
                                border: `1px solid ${alpha('#000', 0.08)}`,
                                mb: 2
                            }}
                        >
                            <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 2 }}>
                                You're requesting repair for the following asset:
                            </Typography>

                            <Stack spacing={2.5}>
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
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* Repair Details Section */}
                    <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.primary" fontWeight={600} sx={{ mb: 1.5 }}>
                            Repair Details
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Repair Date"
                                        value={repairDate}
                                        onChange={(newValue) => setRepairDate(newValue)}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                variant: 'outlined',
                                                sx: {
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 1.5
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="technician-select-label">Technician</InputLabel>
                                    <Select
                                        labelId="technician-select-label"
                                        id="technician-select"
                                        value={technician}
                                        label="Technician"
                                        onChange={(e) => setTechnician(e.target.value)}
                                        startAdornment={
                                            <TechnicianIcon color="action" sx={{ ml: 1, mr: 0.5 }} />
                                        }
                                        sx={{
                                            borderRadius: 1.5,
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: alpha('#000', 0.23),
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: theme.palette.primary.main,
                                            }
                                        }}
                                    >
                                        <MenuItem value="internal">Internal IT Staff</MenuItem>
                                        <MenuItem value="vendor">Vendor Technician</MenuItem>
                                        <MenuItem value="contractor">External Contractor</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="Reason for Repair / Description of Issue"
                                    multiline
                                    rows={4}
                                    value={repairReason}
                                    onChange={(e) => setRepairReason(e.target.value)}
                                    fullWidth
                                    placeholder="Please describe the issue with this asset that needs repair..."
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1.5
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
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
                        // startIcon={<RepairIcon />}
                        // disabled={!repairReason.trim()}
                        />
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
}

export default Repair;