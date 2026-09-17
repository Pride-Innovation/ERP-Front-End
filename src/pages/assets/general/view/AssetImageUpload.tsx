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

/**
 * One corner radius for the whole panel.
 *
 * This component previously used four: the dropzone at 16px, the icon tile at 10px, the button at
 * 12px and the file-type chip at 40px — inside a box roughly 230px tall. Nothing was wrong with any
 * one of them, but together they gave the panel no single shape, which is most of why it read as
 * unfinished. The pill on the file-type chip stays a pill, because a pill is a category of its own
 * rather than a fifth radius.
 */
const RADIUS = '10px';

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
    // Tracks a failed image load so we fall back to the placeholder instead of a broken image icon.
    const [loadFailed, setLoadFailed] = useState<boolean>(false);

    useEffect(() => {
        setLoadFailed(false);
        if (currentImage) {
            if (currentImage.startsWith('http') || currentImage.startsWith('data:')) {
                setPreviewImage(currentImage);
            } else {
                const filename = currentImage.split('/').pop();
                const publicPath = `/statics/${filename}`;
                setPreviewImage(publicPath);
            }
        } else {
            setPreviewImage(null);
        }
    }, [currentImage]);

    // Show the image only when we have a source that hasn't failed to load.
    const showImage = !!previewImage && !loadFailed;

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
            setLoadFailed(false);

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
                            width: 56,
                            height: 56,
                            // Same radius family as the container, so the two read as one object
                            // rather than as a rounded tile sitting in a differently-rounded box.
                            borderRadius: RADIUS,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha(PRIMARY_COLOR, 0.08),
                            color: PRIMARY_COLOR,
                            mb: 2.5,
                            // 1px, not 2px: on a 56px tile a 2px edge is the loudest thing on a
                            // panel whose job is to be empty and quiet.
                            border: `1px solid ${alpha(PRIMARY_COLOR, 0.18)}`,
                        }}
                    >
                        {assetType === 'IT Equipment' ? (
                            <DevicesOtherIcon sx={{ fontSize: 26 }} />
                        ) : (
                            <PhotoCameraIcon sx={{ fontSize: 26 }} />
                        )}
                    </Paper>
                    <Button
                        variant="contained"
                        startIcon={readOnly ? <ImageNotSupportedIcon /> : <AddPhotoAlternateIcon />}
                        disableElevation
                        onClick={(e) => {
                            e.preventDefault();
                            if (!readOnly && fileInputRef.current) {
                                fileInputRef.current.click();
                            }
                        }}
                        sx={{
                            mb: 1.75,
                            px: 2.25,
                            py: 0.85,
                            borderRadius: RADIUS,
                            /*
                             * One treatment, not three. This carried a gradient AND a border AND a
                             * shadow, which on a small button reads as three competing edges. A flat
                             * brand fill with one soft shadow is enough, and it stops the button
                             * fighting the panel it sits inside.
                             */
                            backgroundColor: PRIMARY_COLOR,
                            color: '#fff',
                            fontWeight: 600,
                            textTransform: 'none',
                            fontSize: '0.875rem',
                            letterSpacing: '0.01em',
                            boxShadow: `0 1px 2px ${alpha(PRIMARY_COLOR, 0.24)}`,
                            '&:hover': !readOnly ? {
                                backgroundColor: '#065E53',
                                boxShadow: `0 2px 8px ${alpha(PRIMARY_COLOR, 0.3)}`,
                            } : {},
                            // Read-only says "there is nothing here", so it should not look pressable.
                            ...(readOnly && {
                                backgroundColor: alpha('#000', 0.05),
                                color: alpha('#000', 0.45),
                                boxShadow: 'none',
                            }),
                            cursor: readOnly ? 'default' : 'pointer',
                            pointerEvents: readOnly ? 'none' : 'auto',
                        }}
                    >
                        {readOnly ? 'No Image Available' : 'Add Image'}
                    </Button>
                    {!readOnly && (
                        <>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: alpha('#000', 0.55),
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    mb: 1.25,
                                    lineHeight: 1.4,
                                }}
                            >
                                <CloudUploadIcon sx={{ fontSize: 15, color: alpha(PRIMARY_COLOR, 0.6) }} />
                                Drag & drop an image here or click to upload
                            </Typography>

                            <Typography
                                variant="caption"
                                sx={{
                                    color: alpha('#000', 0.45),
                                    py: 0.4,
                                    px: 1.25,
                                    /*
                                     * A pill, and solid. It was a dashed pill directly under a
                                     * dashed dropzone edge — two dashed outlines a few pixels apart,
                                     * which is most of why the panel looked unresolved. Dashed now
                                     * means one thing here: the drop target.
                                     */
                                    borderRadius: 999,
                                    bgcolor: alpha('#000', 0.04),
                                    border: `1px solid ${alpha('#000', 0.07)}`,
                                    fontSize: '0.7rem',
                                    letterSpacing: '0.01em',
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
                            // Matches the container it sits on top of; at 8 against a 16px box it
                            // left a visible sliver of the panel showing at each top corner.
                            borderTopLeftRadius: RADIUS,
                            borderTopRightRadius: RADIUS,
                            borderBottomLeftRadius: 0,
                            borderBottomRightRadius: 0,
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
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: RADIUS,
                    /*
                     * A complete border, not a lone `borderBottom`.
                     *
                     * A bottom-only edge on a rounded box stops short of both corners, so the box
                     * reads as unfinished — which is exactly what it looked like. Dashed while empty
                     * because that is the convention for "drop something here"; solid once an image
                     * is in place, since there is nothing left to invite.
                     */
                    border: showImage
                        ? `1px solid ${alpha('#000', 0.09)}`
                        : `1.5px dashed ${alpha(PRIMARY_COLOR, 0.28)}`,
                    backgroundColor: isDragging ? alpha(PRIMARY_COLOR, 0.06) : '#FFFFFF',
                    cursor: readOnly ? 'default' : 'pointer',
                    transition: 'border-color .18s ease, background-color .18s ease, box-shadow .18s ease',
                    ...(!readOnly && !showImage && {
                        '&:hover': {
                            borderColor: alpha(PRIMARY_COLOR, 0.55),
                            backgroundColor: alpha(PRIMARY_COLOR, 0.02),
                        },
                    }),
                    ...(isDragging && {
                        borderStyle: 'solid',
                        borderColor: PRIMARY_COLOR,
                        boxShadow: `0 0 0 3px ${alpha(PRIMARY_COLOR, 0.16)}`,
                    }),
                }}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {/* Add actual image element when we have a preview image that loads successfully */}
                {showImage && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 0
                        }}
                    >
                        <img
                            src={previewImage as string}
                            alt="Asset Preview"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                display: 'block'
                            }}
                            onError={() => {
                                console.error('Image failed to load:', previewImage);
                                setLoadFailed(true); // fall back to the placeholder
                            }}
                        />
                    </Box>
                )}

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

                {!showImage && renderPlaceholder()}

                {isDragging && !readOnly && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bgcolor: alpha(PRIMARY_COLOR, 0.92),
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            borderRadius: RADIUS,
                            zIndex: 2,
                        }}
                    >
                        <CloudUploadIcon sx={{ fontSize: 36, mb: 1.25 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Drop to upload</Typography>
                    </Box>
                )}

                {showImage && !readOnly && !isDragging && !isUploading && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bgcolor: 'rgba(0,0,0,0.55)',
                            borderRadius: RADIUS,
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
                        <Typography
                            variant="body2"
                            sx={{ color: '#fff', fontWeight: 600, mb: 1.5, letterSpacing: '0.01em' }}
                        >
                            Change image
                        </Typography>
                        <Box>
                            <Tooltip title="Upload new image">
                                <IconButton
                                    color="primary"
                                    sx={{
                                        bgcolor: '#fff',
                                        // Was `wheat` — a placeholder tan that matched nothing else
                                        // on the page. The icon already carries the meaning, so the
                                        // hover only needs to acknowledge the pointer.
                                        '&:hover': { bgcolor: alpha(PRIMARY_COLOR, 0.12) },
                                        mr: 1,
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
                                        bgcolor: '#fff',
                                        '&:hover': { bgcolor: alpha('#D32F2F', 0.12) },
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