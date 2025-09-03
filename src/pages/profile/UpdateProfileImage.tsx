/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Typography,
    Button,
    Stack,
    Paper,
    alpha,
    Avatar,
    IconButton,
    useTheme,
    useMediaQuery,
    Divider,
    Tooltip,
    CircularProgress,
    Button as MuiButton
} from "@mui/material";
import InputFileUpload from "../../components/forms/FileUpload";
import { useRef, useState } from "react";
import { IUpdateProfileImage } from "./interface";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import InfoIcon from '@mui/icons-material/Info';
import ButtonComponent from "../../components/forms/Button";

// Brand colors
const PRIMARY_COLOR = '#08796C'; // Teal
const SECONDARY_COLOR = '#BC892C'; // Gold

const UpdateProfileImage = ({ setImage, userImage }: IUpdateProfileImage) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [uploading, setUploading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [originalImage, setOriginalImage] = useState(userImage);

    const handleButtonClick = () => {
        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.click();
        }
    };

    const handleFileUpload = (files: FileList | null) => {
        if (!files) return;

        const file = files[0];
        if (!file.type.startsWith('image/')) {
            // Handle non-image file
            return;
        }

        setUploading(true);

        // Simulate upload processing
        setTimeout(() => {
            setImage(URL.createObjectURL(file));
            setHasChanges(true);
            setUploading(false);
        }, 800);
    };

    const handleResetImage = () => {
        setImage(originalImage);
        setHasChanges(false);
    };

    const handleSubmit = () => {
        // Add actual submission logic here
        console.log("Submit photo");

        // Update original image reference after successful upload
        setOriginalImage(userImage);
        setHasChanges(false);
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${alpha('#000', 0.08)}`,
                bgcolor: 'white',
            }}
        >
            {/* Header Section */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 3
                }}
            >
                <PhotoCameraIcon
                    sx={{
                        color: PRIMARY_COLOR,
                        mr: 1.5,
                        fontSize: '1.8rem'
                    }}
                />
                <Box>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            mb: 0.5
                        }}
                    >
                        Update Profile Picture
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Upload a new profile photo to personalize your account
                    </Typography>
                </Box>
            </Box>

            {/* Image Preview Section */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    position: 'relative',
                    mb: 3,
                }}
            >
                <Box
                    sx={{
                        position: 'relative',
                        mb: 2
                    }}
                >
                    <Avatar
                        src={userImage}
                        alt="User Profile"
                        sx={{
                            width: 180,
                            height: 180,
                            border: `4px solid ${alpha(PRIMARY_COLOR, 0.1)}`,
                            boxShadow: `0 4px 20px ${alpha('#000', 0.15)}`,
                        }}
                    />

                    {uploading && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: alpha('#000', 0.4),
                                borderRadius: '50%',
                                zIndex: 2
                            }}
                        >
                            <CircularProgress size={50} sx={{ color: 'white' }} />
                        </Box>
                    )}
                </Box>

                {/* Image Controls */}
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        mb: 1,
                        justifyContent: 'center'
                    }}
                >
                    {hasChanges && (
                        <Tooltip title="Reset to original image">
                            <IconButton
                                onClick={handleResetImage}
                                sx={{
                                    color: alpha('#000', 0.6),
                                    '&:hover': {
                                        bgcolor: alpha('#000', 0.08),
                                        color: 'text.primary'
                                    }
                                }}
                            >
                                <RotateLeftIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ my: 2 }}>
                <Typography
                    variant="subtitle2"
                    sx={{
                        mb: 1.5,
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    Upload a new photo
                    <Tooltip title="Recommended: Square image, at least 400x400 pixels">
                        <InfoIcon
                            sx={{
                                ml: 0.5,
                                fontSize: '1rem',
                                color: alpha('#000', 0.5)
                            }}
                        />
                    </Tooltip>
                </Typography>

                <Button
                    sx={{
                        height: 48,
                        width: "100%",
                        borderRadius: 1.5,
                        border: `1px dashed ${alpha(PRIMARY_COLOR, 0.5)}`,
                        bgcolor: alpha(PRIMARY_COLOR, 0.04),
                        color: PRIMARY_COLOR,
                        textTransform: 'none',
                        fontWeight: 500,
                        '&:hover': {
                            bgcolor: alpha(PRIMARY_COLOR, 0.08),
                            border: `1px dashed ${PRIMARY_COLOR}`,
                        }
                    }}
                    onClick={handleButtonClick}
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    disabled={uploading}
                >
                    {uploading ? 'Uploading...' : 'Select Image'}
                </Button>

                <InputFileUpload inputRef={inputRef} handleFileUpload={handleFileUpload} />

                <Typography
                    variant="caption"
                    sx={{
                        mt: 1,
                        display: 'block',
                        textAlign: 'center',
                        color: 'text.secondary'
                    }}
                >
                    Supported formats: JPG, PNG, GIF (Max 5MB)
                </Typography>
            </Box>

            {/* Action Buttons */}
            <Divider sx={{ my: 2 }} />

            <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{
                    mt: 3,
                    justifyContent: 'flex-end'
                }}
            >
                <MuiButton
                    onClick={() => console.log("Close modal")}
                    color="inherit"
                    type="button"
                    // sendingRequest={false}
                    // buttonText="Cancel"
                    sx={{
                        bgcolor: alpha('#000', 0.05),
                        color: 'text.secondary',
                        minWidth: { xs: '100%', sm: '120px' },
                        order: { xs: 2, sm: 1 }
                    }}
                >
                    Cancel
                </MuiButton>
                <MuiButton
                    onClick={handleSubmit}
                    // sendingRequest={false}
                    // buttonText="Save Changes"
                    variant="contained"
                    color="primary"
                    type="button"
                    disabled={!hasChanges}
                    sx={{
                        bgcolor: PRIMARY_COLOR,
                        minWidth: { xs: '100%', sm: '140px' },
                        order: { xs: 1, sm: 2 },
                        '&:hover': {
                            bgcolor: alpha(PRIMARY_COLOR, 0.9),
                        },
                        '&.Mui-disabled': {
                            bgcolor: alpha(PRIMARY_COLOR, 0.4),
                            color: 'white'
                        }
                    }}
                >
                    Save Changes
                </MuiButton>
            </Stack>
        </Paper>
    );
};

export default UpdateProfileImage;