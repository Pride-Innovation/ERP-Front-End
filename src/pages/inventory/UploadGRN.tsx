import {
    Box,
    Button,
    Paper,
    Stack
} from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
    useRef,
    useState
} from "react";
import InputFileUpload from "../../components/forms/FileUpload";
import { uploadGRNService } from "./service";
import { toast } from "react-toastify";
import { IGRNUploadResponse } from "./interface";

const UploadGRN = ({ id, onUploaded }: { id?: string | number; onUploaded?: () => void }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [fileUrl, setFileUrl] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);

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
        if (!file) {
            toast.error("No file selected for upload.");
            return;
        }

        if (file) {
            payload.append("file", file);
        }

        try {
            const response = await uploadGRNService(payload, id as string) as IGRNUploadResponse;
            if (response.status === 201) {
                toast.success("File uploaded successfully!");
                onUploaded?.();
            }
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    }


    return (
        <Paper elevation={0} sx={{ bgcolor: '#fafafa', borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', overflow: 'hidden' }}>
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
                        Upload Signed GRN
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
        </Paper>
    );
};

export default UploadGRN;
