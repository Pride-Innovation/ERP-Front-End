/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box, Button, Stack } from "@mui/material";
import InputFileUpload from "../../components/forms/FileUpload";
import { useRef } from "react";
import { IUpdateProfileImage } from "./interface";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ButtonComponent from "../../components/forms/Button";

const UpdateProfileImage = ({ setImage, userImage }: IUpdateProfileImage) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = () => {
        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.click();
        }
    };

    const handleFileUpload = (files: FileList | null) => {
        if (!files) return;
        const file = files[0];
        setImage(URL.createObjectURL(file));
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Box
                component="img"
                sx={{ width: 150, height: 150 }}
                src={userImage}
                alt="User Profile"
            />
            <Box sx={{ width: "100%", my: 2 }}>
                <Button
                    sx={{ minHeight: "40px", width: "100%" }}
                    onClick={handleButtonClick}
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                >
                    Upload Profile
                </Button>
                <InputFileUpload inputRef={inputRef} handleFileUpload={handleFileUpload} />
            </Box>
            <Stack spacing={3} direction="row" sx={{ mt: 3, width: "100%" }}>
                <ButtonComponent
                    handleClick={() => console.log("Submit photo")}
                    sendingRequest={false}
                    buttonText="Submit"
                    variant="contained"
                    buttonColor="info"
                    type="button"
                />
                <ButtonComponent
                    handleClick={() => console.log("Close modal")}
                    buttonColor="error"
                    type="button"
                    sendingRequest={false}
                    buttonText="Cancel"
                />
            </Stack>
        </Box>
    );
};

export default UpdateProfileImage;
