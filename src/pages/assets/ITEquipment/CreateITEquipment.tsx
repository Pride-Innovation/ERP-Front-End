/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
import { IITEquipment, IITEquipmentAxiosResponse } from './interface';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ITEquipmentSchema } from './schema';
import {
    Avatar,
    Box,
    Card,
    Container,
    Typography,
    alpha,
    useMediaQuery,
    useTheme
} from '@mui/material';
import ITEquipmentForm from './ITEquipmentForm';
import { createITEquipmentService } from './service';
import { toast } from 'react-toastify';
import { SelectChangeEvent } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';


// Brand colors
const PRIMARY_COLOR = '#08796C'; // Teal green

const CreateITEquipment = () => {
    const [sendingRequest, setSendingRequest] = useState<boolean>(false);
    const [option, setOption] = useState<string | undefined>('');
    const theme = useTheme();

    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const defaultUser: IITEquipment = {} as IITEquipment;

    const {
        control,
        handleSubmit,
        formState,
        register,
        reset,
        trigger // Add trigger function
    } = useForm<IITEquipment>({
        mode: 'onChange',
        resolver: yupResolver(ITEquipmentSchema),
    });

    useEffect(() => {
        reset({ ...defaultUser });
    }, [reset]);

    const onSubmit = async (formData: IITEquipment) => {
        setSendingRequest(true);
        try {
            const response = await createITEquipmentService(formData) as IITEquipmentAxiosResponse
            if (response.status === 201) {
                toast.success("Asset created successfully!!")
                reset({ ...defaultUser });
                setOption('');
            }
        } catch (error) {
            console.error('Error creating asset:', error);
            toast.error("Failed to create asset. Please try again.");
        }
        setSendingRequest(false);
    };

    const handleChange = (event: SelectChangeEvent) => {
        setOption(event.target.value as string);
    };

    return (
        <Container maxWidth="xl" sx={{
            py: 3,
            bgcolor: '#F3F7FB',
            borderRadius: 2,
            border: `1px solid ${alpha('#000', 0.08)}`
        }}>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar
                    sx={{
                        bgcolor: alpha(PRIMARY_COLOR, 0.12),
                        color: PRIMARY_COLOR,
                        mr: 2,
                        width: { xs: 40, sm: 48 },
                        height: { xs: 40, sm: 48 }
                    }}
                >
                    <AddCircleOutlineIcon />
                </Avatar>
                <Box>
                    <Typography
                        variant={isMobile ? "h6" : "h5"}
                        sx={{
                            fontWeight: 600,
                            color: PRIMARY_COLOR,
                            mb: 0.5
                        }}
                    >
                        Create IT Equipment
                    </Typography>

                    <Typography
                        variant="body2"
                        sx={{ color: alpha('#000', 0.6) }}
                    >
                        Fill in the details below to submit a new IT Equipment
                    </Typography>
                </Box>
            </Box>

            <Card
                elevation={0}
                sx={{
                    borderRadius: 2,
                    border: `1px solid ${alpha('#000', 0.08)}`,
                    overflow: 'visible'
                }}
            >
                <Box sx={{ p: { xs: 2, md: 3 } }}>
                    <form
                        style={{ width: "100%" }}
                        autoComplete="off"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <ITEquipmentForm
                            option={option}
                            handleChange={handleChange}
                            buttonText="Save Equipment"
                            formState={formState}
                            control={control}
                            sendingRequest={sendingRequest}
                            register={register}
                            trigger={trigger}
                        />
                    </form>
                </Box>
            </Card>
        </Container>
    );
};

export default CreateITEquipment;