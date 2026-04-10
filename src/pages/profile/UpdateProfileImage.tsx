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
    Divider,
    Tooltip,
    CircularProgress,
    Alert,
    Fade
} from "@mui/material";
import InputFileUpload from "../../components/forms/FileUpload";
import { useRef, useState } from "react";
import { IUpdateProfileImage } from "./interface";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InfoIcon from '@mui/icons-material/Info';
import { toast } from 'react-toastify';

// Brand colors
const PRIMARY_COLOR = '#08796C'; // Teal
// const SECONDARY_COLOR = '#BC892C'; // Gold

const UpdateProfileImage = ({
    setImage,
    userImage,
    userId,
    onImageUpdate,
    onImageRemove,
    handleClose
}: IUpdateProfileImage) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [originalImage, setOriginalImage] = useState(userImage);
    const [error, setError] = useState<string | null>(null);

    const handleButtonClick = () => {
        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.click();
        }
    };

    const handleFileUpload = async (files: FileList | null) => {
        if (!files) return;

        const file = files[0];
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file (JPEG, PNG, GIF)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            // Create a local preview immediately
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setImage(e.target.result as string);
                    setHasChanges(true);
                }
            };
            reader.readAsDataURL(file);

            // If we have an onImageUpdate handler, call it with the file
            if (onImageUpdate) {
                await onImageUpdate(file);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            setError('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleResetImage = async () => {
        setImage(originalImage);
        setHasChanges(false);
    };

    const handleRemoveImage = async () => {
        if (!onImageRemove) return;

        setUploading(true);
        try {
            await onImageRemove();
            setHasChanges(false);
            toast.success('Profile image removed successfully');
        } catch (error) {
            console.error('Error removing image:', error);
            setError('Failed to remove profile image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        setOriginalImage(userImage);
        setHasChanges(false);
        handleClose();
        // toast.success('Profile image updated successfully');
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
            {error && (
                <Fade in={!!error}>
                    <Alert
                        severity="error"
                        sx={{ mb: 2 }}
                        onClose={() => setError(null)}
                    >
                        {error}
                    </Alert>
                </Fade>
            )}

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

                    {userImage && onImageRemove && (
                        <Tooltip title="Remove profile image">
                            <IconButton
                                onClick={handleRemoveImage}
                                sx={{
                                    color: alpha('#f44336', 0.7),
                                    '&:hover': {
                                        bgcolor: alpha('#f44336', 0.08),
                                        color: '#f44336'
                                    }
                                }}
                            >
                                <DeleteOutlineIcon />
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
                <Button
                    onClick={handleClose}
                    color="inherit"
                    variant="outlined"
                    type="button"
                    sx={{
                        bgcolor: alpha('#000', 0.05),
                        color: 'text.secondary',
                        minWidth: { xs: '100%', sm: '120px' },
                        order: { xs: 2, sm: 1 }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    type="button"
                    disabled={!hasChanges || uploading}
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
                </Button>
            </Stack>
        </Paper>
    );
};

export default UpdateProfileImage;