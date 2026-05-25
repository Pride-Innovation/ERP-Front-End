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
    CircularProgress
} from "@mui/material";
import ButtonComponent from "../../components/forms/Button";
import { IAssetAxiosResponse, IRepair } from "./interface";
import {
    Build as RepairIcon,
    Assignment as AssetIcon,
    Fingerprint as FingerprintIcon,
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
import LaptopIcon from '@mui/icons-material/Laptop';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SettingsIcon from '@mui/icons-material/Settings';
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

const PRIMARY_COLOR = '#08796C';
const TechnicianIcon = HandymanOutlinedIcon;

const Repair = ({
    handleClose,
    sendingRequest,
    buttonText,
    asset,
    module
}: IRepair) => {
    const theme = useTheme();
    const [repairDate, setRepairDate] = useState<Dayjs | null>(null);
    const [repairReason, setRepairReason] = useState("");
    const [technicianType, setTechnicianType] = useState("");
    const [technicianName, setTechnicianName] = useState("");
    const [selectedInternalTechnician, setSelectedInternalTechnician] = useState<IOptions | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
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
    const { fetchAllUsers } = UserUtils();
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
        <Card
            elevation={0}
            sx={{
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${alpha(PRIMARY_COLOR, 0.15)}`,
                height: '100%',
                maxHeight: '100vh',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Top accent bar */}
            <Box sx={{ height: 3, bgcolor: PRIMARY_COLOR }} />

            <Box
                sx={{
                    bgcolor: alpha(PRIMARY_COLOR, 0.05),
                    py: 1.5,
                    px: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    borderBottom: `1px solid ${alpha(PRIMARY_COLOR, 0.1)}`
                }}
            >
                <Box sx={{
                    width: 34, height: 34, borderRadius: 1.5,
                    bgcolor: alpha(PRIMARY_COLOR, 0.12),
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <RepairIcon sx={{ color: PRIMARY_COLOR, fontSize: 18 }} />
                </Box>
                <Box>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: PRIMARY_COLOR, lineHeight: 1.2 }}>
                        Asset Repair Request
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Submit a maintenance and repair ticket
                    </Typography>
                </Box>
            </Box>

            <CardContent sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                height: '100%',
                                borderRadius: 1.5,
                                bgcolor: alpha(PRIMARY_COLOR, 0.02),
                                border: `1px solid ${alpha(PRIMARY_COLOR, 0.08)}`,
                                borderLeft: `3px solid ${alpha(PRIMARY_COLOR, 0.35)}`,
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <AssetIcon sx={{ color: PRIMARY_COLOR, mr: 1 }} />
                                <Typography variant="subtitle2" fontWeight={600} sx={{ color: PRIMARY_COLOR }}>
                                    Asset Information
                                </Typography>
                            </Box>

                            <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
                                <Stack spacing={1.5}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box
                                            sx={{
                                                bgcolor: theme.palette.primary.main,
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                p: 0.7,
                                                borderRadius: 1,
                                                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                                            }}
                                        >
                                            <LaptopIcon fontSize="small" />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                                Asset Name
                                            </Typography>
                                            <Typography variant="body2" fontWeight={600} color="text.primary">
                                                {asset?.assetName}
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
                                                p: 0.7,
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
                                                <Typography variant="body2" fontWeight={500} color="text.primary">
                                                    {asset.engravedNumber}
                                                </Typography>
                                            ) : (
                                                <Typography variant="body2" fontStyle="italic" color="text.disabled">
                                                    Not specified
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>

                                    {asset.branch && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box
                                                sx={{
                                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                                    color: theme.palette.success.main,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    p: 0.7,
                                                    borderRadius: 1
                                                }}
                                            >
                                                <LocationOnIcon fontSize="small" />
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                                    Location
                                                </Typography>
                                                <Typography variant="body2" fontWeight={500} color="text.primary">
                                                    {asset.branch?.name}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}

                                    {asset.make && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box
                                                sx={{
                                                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                                                    color: theme.palette.warning.main,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    p: 0.7,
                                                    borderRadius: 1
                                                }}
                                            >
                                                <SettingsIcon fontSize="small" />
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                                    Make/Model
                                                </Typography>
                                                <Typography variant="body2" fontWeight={500} color="text.primary">
                                                    {asset.make}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}

                                    {asset.lastRepairedBy && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box
                                                sx={{
                                                    bgcolor: alpha(theme.palette.info.main, 0.1),
                                                    color: theme.palette.info.main,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    p: 0.7,
                                                    borderRadius: 1
                                                }}
                                            >
                                                <RepairIcon fontSize="small" />
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                                    Last Repaired By
                                                </Typography>
                                                <Typography variant="body2" fontWeight={500} color="text.primary">
                                                    {asset.lastRepairedBy}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
                                </Stack>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={5}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                height: '100%',
                                borderRadius: 1.5,
                                bgcolor: alpha(PRIMARY_COLOR, 0.02),
                                border: `1px solid ${alpha('#000', 0.06)}`,
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <RepairIcon sx={{ color: PRIMARY_COLOR, mr: 1 }} />
                                <Typography variant="subtitle2" fontWeight={600} sx={{ color: PRIMARY_COLOR }}>
                                    Repair Information
                                </Typography>
                            </Box>

                            <Stack spacing={2} sx={{ flexGrow: 1 }}>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DatePicker
                                        label="Repair Start Date"
                                        value={repairDate}
                                        onChange={(newValue) => setRepairDate(newValue)}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                size: "small",
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

                                <FormControl fullWidth size="small">
                                    <InputLabel id="technician-type-select-label">Technician Type</InputLabel>
                                    <Select
                                        labelId="technician-type-select-label"
                                        id="technician-type-select"
                                        value={technicianType}
                                        label="Technician Type"
                                        onChange={(e) => handleTechnicianTypeChange(e.target.value)}
                                        startAdornment={
                                            <TechnicianIcon color="action" sx={{ ml: 1, mr: 0.5 }} fontSize="small" />
                                        }
                                        sx={{
                                            borderRadius: 1.5,
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
                                        onChange={(_, value) => {
                                            setSelectedInternalTechnician(value);
                                        }}
                                        loading={loading || searchLoading}
                                        fullWidth
                                        noOptionsText="No technicians found"
                                        loadingText="Searching technicians..."
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
                                                label="Select Internal Technician"
                                                placeholder="Search by name or employee ID"
                                                variant="outlined"
                                                size="small"
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
                                        label={technicianType === "vendor" ? "Vendor Technician Name" : "External Contractor Name"}
                                        value={technicianName}
                                        onChange={(e) => setTechnicianName(e.target.value)}
                                        fullWidth
                                        size="small"
                                        placeholder={technicianType === "vendor" ? "Enter vendor technician name" : "Enter contractor name"}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 1.5
                                            }
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <TechnicianIcon color="action" sx={{ ml: 1, mr: 0.5 }} fontSize="small" />
                                            ),
                                        }}
                                    />
                                ) : null}

                                <TextField
                                    label="Reason for Repair"
                                    multiline
                                    rows={6}
                                    value={repairReason}
                                    onChange={(e) => setRepairReason(e.target.value)}
                                    fullWidth
                                    size="small"
                                    placeholder="Please describe the issue with this asset that needs repair..."
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1.5
                                        },
                                        flexGrow: 1
                                    }}
                                />
                            </Stack>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                height: '100%',
                                borderRadius: 1.5,
                                bgcolor: alpha(PRIMARY_COLOR, 0.02),
                                border: `1px solid ${alpha('#000', 0.06)}`,
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <AttachFileIcon sx={{ color: PRIMARY_COLOR, mr: 1 }} />
                                <Typography variant="subtitle2" fontWeight={600} sx={{ color: PRIMARY_COLOR }}>
                                    Supporting Documents
                                </Typography>
                            </Box>

                            <Box sx={{
                                flexGrow: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                borderRadius: 1.5,
                                border: `1px dashed ${isDragging ? theme.palette.info.main : alpha('#000', 0.15)}`,
                                bgcolor: isDragging ? alpha(theme.palette.info.main, 0.05) : 'transparent',
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
                                            sx={{ borderRadius: 1.5 }}
                                        >
                                            Select Files
                                        </Button>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                        <List dense sx={{ py: 0, flexGrow: 1, overflow: 'auto' }}>
                                            {files.map((file, index) => (
                                                <ListItem
                                                    key={index}
                                                    sx={{
                                                        px: 1.5,
                                                        py: 0.75,
                                                        borderRadius: 1,
                                                        mb: 0.5,
                                                        bgcolor: alpha(theme.palette.background.paper, 0.8),
                                                        border: `1px solid ${alpha('#000', 0.05)}`,
                                                        '&:hover': {
                                                            bgcolor: alpha(theme.palette.background.paper, 1),
                                                            borderColor: alpha(theme.palette.primary.main, 0.2)
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
                                            bgcolor: alpha(theme.palette.background.paper, 0.5)
                                        }}>
                                            <Typography variant="caption" color="text.secondary">
                                                {files.length} file{files.length !== 1 ? 's' : ''} selected
                                            </Typography>
                                            <Button
                                                size="small"
                                                color="info"
                                                sx={{ fontSize: '0.7rem', p: 0.5, minWidth: 'auto' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    fileInputRef.current?.click();
                                                }}
                                            >
                                                Add More
                                            </Button>
                                        </Box>
                                    </Box>
                                )}
                            </Box>

                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                Supported: Images (JPG, PNG), Documents (PDF, DOC)
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                    <Stack direction="row" spacing={1.5}>
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
                            handleClick={handleAssetRepair}
                            buttonText={buttonText}
                        />
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
}

export default Repair;