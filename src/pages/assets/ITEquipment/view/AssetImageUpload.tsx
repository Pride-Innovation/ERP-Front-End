/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useState, useRef, useEffect } from 'react';
import {
    Box,
    Typography,
    alpha,
    IconButton,
    CircularProgress,
    Paper,
    Tooltip,
    Fade,
    Alert,
    Button
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DevicesOtherIcon from '@mui/icons-material/DevicesOther';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
// Brand colors
const PRIMARY_COLOR = '#08796C';

interface AssetImageUploadProps {
    currentImage: string | null;
    assetName: string;
    assetType: string;
    onImageUpdate: (file: File) => Promise<void>;
    onImageRemove?: () => Promise<void>;
    readOnly?: boolean;
    height?: number | string;
}

const AssetImageUpload = ({
    currentImage,
    assetType,
    onImageUpdate,
    onImageRemove,
    readOnly = false,
    height = 220
}: AssetImageUploadProps) => {
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(currentImage);

    useEffect(() => {
        setPreviewImage(currentImage);
    }, [currentImage]);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!readOnly) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!readOnly) setIsDragging(true);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (readOnly) return;

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            await processFile(file);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            await processFile(file);
        }
    };

    const processFile = async (file: File) => {
        if (!file.type.match('image.*')) {
            setError('Please select an image file (JPEG, PNG, WebP)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB');
            return;
        }

        try {
            setIsUploading(true);
            setError(null);

            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setPreviewImage(e.target.result as string);
                }
            };
            reader.readAsDataURL(file);

            await onImageUpdate(file);
        } catch (err) {
            setError('Failed to upload image. Please try again.');
            console.error('Image upload error:', err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveImage = async () => {
        if (onImageRemove && !readOnly) {
            try {
                setIsUploading(true);
                await onImageRemove();
                setPreviewImage(null);
            } catch (err) {
                setError('Failed to remove image');
            } finally {
                setIsUploading(false);
            }
        }
    };

    const renderPlaceholder = () => (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                p: 3,
                textAlign: 'center'
            }}
        >
            {isUploading ? (
                <CircularProgress size={48} sx={{ color: PRIMARY_COLOR, mb: 2 }} />
            ) : (
                <>
                    <Paper
                        elevation={0}
                        sx={{
                            width: 50,
                            height: 50,
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha(PRIMARY_COLOR, 0.1),
                            color: PRIMARY_COLOR,
                            mb: 3,
                            border: `2px solid ${alpha(PRIMARY_COLOR, 0.2)}`
                        }}
                    >
                        {assetType === 'IT Equipment' ? (
                            <DevicesOtherIcon sx={{ fontSize: 40 }} />
                        ) : (
                            <PhotoCameraIcon sx={{ fontSize: 40 }} />
                        )}
                    </Paper>
                    <Button
                        variant="contained"
                        startIcon={readOnly ? <ImageNotSupportedIcon /> : <AddPhotoAlternateIcon />}
                        disableElevation
                        sx={{
                            mb: 2,
                            px: 2,
                            py: 1,
                            borderRadius: 1.5,
                            backgroundColor: PRIMARY_COLOR,
                            backgroundImage: `linear-gradient(135deg, ${PRIMARY_COLOR}, ${alpha(PRIMARY_COLOR, 0.85)})`,
                            color: 'white',
                            fontWeight: 500,
                            textTransform: 'none',
                            fontSize: '0.95rem',
                            border: `1px solid ${alpha(PRIMARY_COLOR, 0.2)}`,
                            boxShadow: `0 2px 6px ${alpha(PRIMARY_COLOR, 0.25)}`,
                            '&:hover': !readOnly ? {
                                backgroundColor: alpha(PRIMARY_COLOR, 0.9),
                                boxShadow: `0 3px 8px ${alpha(PRIMARY_COLOR, 0.3)}`,
                            } : {},
                            cursor: readOnly ? 'default' : 'pointer',
                            pointerEvents: readOnly ? 'none' : 'auto'
                        }}
                    >
                        {readOnly ? 'No Image Available' : 'Add an Image'}
                    </Button>
                    {!readOnly && (
                        <>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: 'text.secondary',
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 1
                                }}
                            >
                                <CloudUploadIcon fontSize="small" sx={{ mr: 0.5, fontSize: 16 }} />
                                Drag & drop an image here or click to upload
                            </Typography>

                            <Typography
                                variant="caption"
                                sx={{
                                    color: alpha('#000', 0.4),
                                    p: 0.75,
                                    px: 1.5,
                                    borderRadius: 5,
                                    bgcolor: alpha('#000', 0.05),
                                    border: `1px dashed ${alpha('#000', 0.1)}`
                                }}
                            >
                                JPEG, PNG, WebP (max 5MB)
                            </Typography>
                        </>
                    )}
                </>
            )}
        </Box>
    );

    return (
        <Box sx={{ position: 'relative', width: '100%', height }}>
            {error && (
                <Fade in={!!error}>
                    <Alert
                        severity="error"
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            zIndex: 2,
                            borderTopLeftRadius: 8,
                            borderTopRightRadius: 8,
                        }}
                        onClose={() => setError(null)}
                    >
                        {error}
                    </Alert>
                </Fade>
            )}

            <Box
                component={readOnly ? 'div' : 'label'}
                htmlFor="asset-image-upload"
                sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: isDragging ? alpha(PRIMARY_COLOR, 0.1) : alpha('#f5f5f5', 0.5),
                    borderRadius: 2,
                    position: 'relative',
                    overflow: 'hidden',
                    borderBottom: `1px solid ${alpha('#000', 0.06)}`,
                    cursor: readOnly ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                    ...(isDragging && {
                        borderColor: PRIMARY_COLOR,
                        boxShadow: `0 0 0 2px ${alpha(PRIMARY_COLOR, 0.3)}`
                    }),
                    ...(previewImage && {
                        backgroundImage: `url(${previewImage})`,
                        backgroundSize: 'contain',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    })
                }}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {!readOnly && (
                    <input
                        ref={fileInputRef}
                        id="asset-image-upload"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                        disabled={isUploading || readOnly}
                    />
                )}

                {!previewImage && renderPlaceholder()}

                {isDragging && !readOnly && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bgcolor: alpha(PRIMARY_COLOR, 0.9),
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            zIndex: 2
                        }}
                    >
                        <CloudUploadIcon sx={{ fontSize: 48, mb: 2 }} />
                        <Typography variant="h6">Drop to upload</Typography>
                    </Box>
                )}

                {previewImage && !readOnly && !isDragging && !isUploading && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bgcolor: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            '&:hover': {
                                opacity: 1
                            },
                            zIndex: 1
                        }}
                    >
                        <Typography variant="body1" sx={{ color: 'white', mb: 2 }}>
                            Change image
                        </Typography>
                        <Box>
                            <Tooltip title="Upload new image">
                                <IconButton
                                    color="primary"
                                    sx={{
                                        bgcolor: 'white',
                                        '&:hover': { bgcolor: "wheat" },
                                        mr: 1
                                    }}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <PhotoCameraIcon />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Remove image">
                                <IconButton
                                    color="error"
                                    sx={{
                                        bgcolor: 'white',
                                        '&:hover': { bgcolor: "wheat" }
                                    }}
                                    onClick={handleRemoveImage}
                                >
                                    <DeleteOutlineIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                )}

                {isUploading && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bgcolor: 'rgba(255,255,255,0.8)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2
                        }}
                    >
                        <CircularProgress size={48} sx={{ color: PRIMARY_COLOR }} />
                        <Typography sx={{ mt: 2, color: 'text.secondary' }}>
                            Processing image...
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default AssetImageUpload;