/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/
import {
    Box,
    Grid,
    Stack,
    Typography,
    TextField,
    alpha,
    Paper,
    useTheme,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete,
    CircularProgress,
    Theme
} from "@mui/material";
import { IAssetAxiosResponse, IRepair } from "./interface";
import {
    Build as RepairIcon,
    AttachFile as AttachFileIcon,
    CloudUpload as UploadIcon,
    Image as ImageIcon,
    PictureAsPdf as PdfIcon,
    InsertDriveFile as FileIcon,
    Delete as DeleteIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { useState, useRef, useEffect } from "react";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';
import { toast } from "react-toastify";
import axiosInstance from "../../core/apis/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { updateGeneralAssetInStore } from "./general/slice";
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import { IOptions } from "../../components/tables/interface";
import { useDebounce } from "../../hooks/useDebounce";
import UserUtils from "../users/utils";
import { searchUserService } from "../users/service";
import { IUsersAxiosResponse } from "../users/interface";
import { loadUsers } from "../users/slice";
import { fieldSx } from "../../components/forms/Inputs";
import ActionModalShell, { AssetIdentityCard, DetailRows } from "./ActionModalShell";

const TechnicianIcon = HandymanOutlinedIcon;

/** Column heading — replaces the per-field coloured icon tiles the panels used to carry. */
const PanelHeading = ({ icon, title }: { icon: React.ReactNode; title: string }) => {
    const theme = useTheme();
    return (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Box sx={{ color: theme.palette.info.dark, display: 'flex' }}>{icon}</Box>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                {title}
            </Typography>
        </Stack>
    );
};

const panelSx = (theme: Theme) => ({
    p: 2.5,
    height: '100%',
    borderRadius: 1.5,
    bgcolor: alpha(theme.palette.grey[500], 0.04),
    border: `1px solid ${alpha(theme.palette.grey[500], 0.15)}`,
    display: 'flex',
    flexDirection: 'column' as const,
});

const Repair = ({
    handleClose,
    sendingRequest,
    buttonText,
    asset,
}: IRepair) => {
    const theme = useTheme();
    const [repairDate, setRepairDate] = useState<Dayjs | null>(null);
    const [repairReason, setRepairReason] = useState("");
    const [technicianType, setTechnicianType] = useState("");
    const [technicianName, setTechnicianName] = useState("");
    const [selectedInternalTechnician, setSelectedInternalTechnician] = useState<IOptions | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dispatch = useDispatch<AppDispatch>();

    // User search functionality for internal technicians
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [optionsObject, setOptionsObject] = useState<{ usersOptions: Array<IOptions> }>({
        usersOptions: []
    });
    const { users } = useSelector((state: RootState) => state.UserStore);
    const { fetchStaffOptions } = UserUtils();
    const [localInput, setLocalInput] = useState<string>('');
    const debouncedInput = useDebounce(localInput, 500);

    useEffect(() => {
        if (users.length > 0)
            setOptionsObject({
                usersOptions: users?.map(user => ({ label: `${user.firstName} ${user.lastName}` as string, value: user.id as number, user: user })) || [],
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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles(prevFiles => [...prevFiles, ...newFiles]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const newFiles = Array.from(e.dataTransfer.files);
            setFiles(prevFiles => [...prevFiles, ...newFiles]);
        }
    };

    const removeFile = (indexToRemove: number) => {
        setFiles(files.filter((_, index) => index !== indexToRemove));
    };

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase() || '';

        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(extension)) {
            return <ImageIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />;
        } else if (extension === 'pdf') {
            return <PdfIcon fontSize="small" sx={{ color: '#d32f2f' }} />;
        } else {
            return <FileIcon fontSize="small" sx={{ color: theme.palette.info.main }} />;
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const handleAssetRepair = async () => {
        // Determine the final technician value based on type
        let finalTechnicianValue = "";
        if (technicianType === "internal") {
            if (selectedInternalTechnician) {
                finalTechnicianValue = selectedInternalTechnician.label as string;
            }
        } else {
            finalTechnicianValue = technicianName;
        }

        const payload = new FormData();
        payload.append('repairStartDate', repairDate ? repairDate.format('YYYY-MM-DDTHH:mm:ss') : '');
        payload.append('repairEndDate', repairDate ? repairDate.format('YYYY-MM-DDTHH:mm:ss') : '');
        payload.append('repairReason', repairReason);
        payload.append('technician', finalTechnicianValue);

        if (files.length > 0) {
            files.forEach(file => {
                payload.append('documents', file);
            });
        }

        setSaving(true);
        try {
            // Single backend endpoint serves every asset category.
            const response = await axiosInstance.post(
                `assets/repairs/${asset?.id}`,
                payload,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            ) as IAssetAxiosResponse;

            if (response.status === 201) {
                toast.success("Asset repair request submitted successfully");
                dispatch(updateGeneralAssetInStore(response.data));
            }
        } catch (error) {
            console.error("Error repairing asset:", error);
        } finally {
            setSaving(false);
            handleClose();
        }
    }

    const handleTechnicianTypeChange = (value: string) => {
        setTechnicianType(value);
        // Reset values when changing type
        setTechnicianName("");
        setSelectedInternalTechnician(null);
        setLocalInput("");
    };

    return (
        <ActionModalShell
            tone="info"
            icon={<RepairIcon />}
            title="Log a Repair"
            subtitle="Send this asset for maintenance and record who is handling it"
            onCancel={handleClose}
            onConfirm={handleAssetRepair}
            confirmText={buttonText}
            confirmIcon={<RepairIcon />}
            busy={sendingRequest || saving}
            busyText="Submitting..."
            confirmDisabled={!repairReason.trim()}
            scrollBody
        >
            <Grid container spacing={2.5}>
                {/* ── Asset ── */}
                <Grid item xs={12} md={3}>
                    <Paper elevation={0} sx={panelSx(theme)}>
                        <PanelHeading icon={<RepairIcon fontSize="small" />} title="Asset" />
                        <Stack spacing={2.5}>
                            <AssetIdentityCard asset={asset} />
                            <DetailRows
                                rows={[
                                    { label: 'Make / Model', value: asset?.make },
                                    { label: 'Last Repaired By', value: asset?.lastRepairedBy },
                                ]}
                            />
                        </Stack>
                    </Paper>
                </Grid>

                {/* ── Repair details ── */}
                <Grid item xs={12} md={5}>
                    <Paper elevation={0} sx={panelSx(theme)}>
                        <PanelHeading icon={<TechnicianIcon fontSize="small" />} title="Repair details" />

                        <Stack spacing={2} sx={{ flexGrow: 1 }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label="Repair start date"
                                    value={repairDate}
                                    onChange={(newValue) => setRepairDate(newValue)}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            size: 'medium',
                                            helperText: 'When the asset goes in for repair',
                                            sx: fieldSx,
                                        }
                                    }}
                                />
                            </LocalizationProvider>

                            <FormControl fullWidth size="medium" sx={fieldSx}>
                                <InputLabel id="technician-type-select-label">Technician type</InputLabel>
                                <Select
                                    labelId="technician-type-select-label"
                                    id="technician-type-select"
                                    value={technicianType}
                                    label="Technician type"
                                    onChange={(e) => handleTechnicianTypeChange(e.target.value)}
                                >
                                    <MenuItem value="internal">Internal IT Staff</MenuItem>
                                    <MenuItem value="vendor">Vendor Technician</MenuItem>
                                    <MenuItem value="contractor">External Contractor</MenuItem>
                                </Select>
                            </FormControl>

                            {/* Conditional Technician Selection */}
                            {technicianType === "internal" ? (
                                <Autocomplete
                                    open={open}
                                    onOpen={handleOpen}
                                    onClose={() => setOpen(false)}
                                    isOptionEqualToValue={(option, value) => option.value === value.value}
                                    getOptionLabel={(option) => option.label as string}
                                    options={optionsObject.usersOptions}
                                    value={selectedInternalTechnician}
                                    onInputChange={(_, newInputValue) => setLocalInput(newInputValue)}
                                    onChange={(_, value) => setSelectedInternalTechnician(value)}
                                    loading={loading || searchLoading}
                                    fullWidth
                                    noOptionsText="No technicians found"
                                    loadingText="Searching technicians..."
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Internal technician"
                                            placeholder="Search by name or employee ID"
                                            size="medium"
                                            sx={fieldSx}
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <PersonIcon color="action" sx={{ ml: 1, mr: 0.5 }} fontSize="small" />
                                                ),
                                                endAdornment: (
                                                    <>
                                                        {(loading || searchLoading) ? <CircularProgress color="primary" size={16} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                            ) : (technicianType === "vendor" || technicianType === "contractor") ? (
                                <TextField
                                    label={technicianType === "vendor" ? "Vendor technician name" : "External contractor name"}
                                    value={technicianName}
                                    onChange={(e) => setTechnicianName(e.target.value)}
                                    fullWidth
                                    size="medium"
                                    placeholder={technicianType === "vendor" ? "Enter vendor technician name" : "Enter contractor name"}
                                    sx={fieldSx}
                                    InputProps={{
                                        startAdornment: (
                                            <TechnicianIcon color="action" sx={{ ml: 1, mr: 0.5 }} fontSize="small" />
                                        ),
                                    }}
                                />
                            ) : null}

                            <TextField
                                label="Reason for repair"
                                multiline
                                rows={5}
                                value={repairReason}
                                onChange={(e) => setRepairReason(e.target.value)}
                                fullWidth
                                size="medium"
                                placeholder="Describe the fault — what fails, when it started, anything already tried…"
                                helperText="Required. Shown to whoever picks up the repair"
                                sx={{ ...fieldSx, flexGrow: 1 }}
                            />
                        </Stack>
                    </Paper>
                </Grid>

                {/* ── Documents ── */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={panelSx(theme)}>
                        <PanelHeading icon={<AttachFileIcon fontSize="small" />} title="Supporting documents" />

                        <Box sx={{
                            flexGrow: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: 220,
                            borderRadius: 1.5,
                            border: `1px dashed ${isDragging ? theme.palette.info.main : alpha('#000', 0.18)}`,
                            bgcolor: isDragging ? alpha(theme.palette.info.main, 0.05) : '#fff',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            overflow: 'hidden'
                        }}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                multiple
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                                accept="image/*,.pdf,.doc,.docx"
                            />

                            {files.length === 0 ? (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        p: 2,
                                        flexGrow: 1
                                    }}
                                >
                                    <UploadIcon
                                        sx={{
                                            fontSize: 32,
                                            color: isDragging ? theme.palette.info.main : alpha('#000', 0.3),
                                            mb: 1.5
                                        }}
                                    />
                                    <Typography variant="body2" fontWeight={500} color="text.primary" align="center">
                                        Drag and drop files here
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 0.5, mb: 1.5 }}>
                                        or click to browse
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        color="info"
                                        size="small"
                                        startIcon={<AttachFileIcon />}
                                        sx={{ borderRadius: 1.5, textTransform: 'none' }}
                                    >
                                        Select files
                                    </Button>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <List dense sx={{ py: 0.5, px: 0.5, flexGrow: 1, overflow: 'auto' }}>
                                        {files.map((file, index) => (
                                            <ListItem
                                                key={index}
                                                sx={{
                                                    px: 1.5,
                                                    py: 0.75,
                                                    borderRadius: 1,
                                                    mb: 0.5,
                                                    bgcolor: alpha(theme.palette.grey[500], 0.05),
                                                    border: `1px solid ${alpha('#000', 0.05)}`,
                                                    '&:hover': {
                                                        bgcolor: alpha(theme.palette.info.main, 0.05),
                                                        borderColor: alpha(theme.palette.info.main, 0.2)
                                                    }
                                                }}
                                                secondaryAction={
                                                    <IconButton
                                                        edge="end"
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeFile(index);
                                                        }}
                                                        sx={{
                                                            color: alpha(theme.palette.error.main, 0.7),
                                                            '&:hover': {
                                                                bgcolor: alpha(theme.palette.error.main, 0.1),
                                                                color: theme.palette.error.main
                                                            }
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                }
                                            >
                                                <ListItemIcon sx={{ minWidth: 32 }}>
                                                    {getFileIcon(file.name)}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem' }}>
                                                            {file.name.length > 25 ? `${file.name.substring(0, 25)}...` : file.name}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Typography variant="caption" color="text.secondary">
                                                            {formatFileSize(file.size)}
                                                        </Typography>
                                                    }
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        px: 1.5,
                                        py: 0.75,
                                        borderTop: `1px solid ${alpha('#000', 0.06)}`,
                                    }}>
                                        <Typography variant="caption" color="text.secondary">
                                            {files.length} file{files.length !== 1 ? 's' : ''} selected
                                        </Typography>
                                        <Button
                                            size="small"
                                            color="info"
                                            sx={{ fontSize: '0.7rem', p: 0.5, minWidth: 'auto', textTransform: 'none' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                fileInputRef.current?.click();
                                            }}
                                        >
                                            Add more
                                        </Button>
                                    </Box>
                                </Box>
                            )}
                        </Box>

                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                            Supported: Images (JPG, PNG), Documents (PDF, DOC)
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </ActionModalShell>
    );
}

export default Repair;
