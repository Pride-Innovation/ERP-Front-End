import { Box, Button, Card, Stack } from "@mui/material";
import { grey } from "@mui/material/colors";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useContext, useRef, useState } from "react";
import InputFileUpload from "../../components/forms/FileUpload";
import { InventoryContext } from "../../context/inventory";
import { uploadGRNService } from "./service";
import { toast } from "react-toastify";
import { IGRNUploadResponse } from "./interface";

const UploadGRN = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [fileUrl, setFileUrl] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);
    const { currentInventory } = useContext(InventoryContext)


    const handleButtonClick = () => {
        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.click();
        }
    };

    const handleFileUpload = (files: FileList | null) => {
        if (!files) return;
        const file = files[0];
        setFile(file);
        const url = URL.createObjectURL(file);
        setFileUrl(url);
    };

    const handleSubmit = async () => {
        const payload = new FormData();
        payload.append("name", currentInventory?.grnNumber as string || "");

        if (!file) {
            toast.error("No file selected for upload.");
            return;
        }
        
        if (file) {
            payload.append("file", file);
        }
        try {
            const response = await uploadGRNService(payload, currentInventory?.id as string) as IGRNUploadResponse;
            if (response.status === 201) {
                toast.success("File uploaded successfully!");
            }
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    }


    return (
        <Card sx={{ bgcolor: grey[100], borderRadius: 1, boxShadow: "none" }}>
            <Box sx={{ height: 400 }}>
                <iframe
                    src={fileUrl}
                    title="PDF Preview"
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                />
            </Box>
            <Box sx={{ p: 2 }}>
                <Stack direction={"row"} spacing={2} justifyContent="center" alignItems="center">
                    <Button
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        fullWidth
                        onClick={handleButtonClick}
                    >
                        Signed GRN Upload
                    </Button>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleSubmit}
                    >
                        Submit
                    </Button>
                </Stack>
                <InputFileUpload inputRef={inputRef} handleFileUpload={handleFileUpload} />
            </Box>
        </Card>
    );
};

export default UploadGRN;
