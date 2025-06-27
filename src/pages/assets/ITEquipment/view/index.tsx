/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Typography,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Box,
    Divider,
    Stack,
} from '@mui/material';
import PlaceHolder from "../../../../statics/images/Placeholder.png";
import TabComponent from '../../../../components/tabs';
import { grey } from '@mui/material/colors';
import ButtonComponent from '../../../../components/forms/Button';
import DetailSection from '../../trails/DetailSection';
import OtherDetails from './OtherDetails';
import AssignmentHistory from '../../trails/AssignmentHistory';
import RepairHistory from '../../trails/RepairHistory';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { IITEquipment, IITEquipmentAxiosResponse } from '../interface';
import { getITEquipmentByIDService } from '../service';
import Loading from '../../../../components/loading';

const ITEquipmentDetails = () => {
    const [equipment, setEquipment] = useState<IITEquipment>({} as IITEquipment)
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState<boolean>(false)


    const getITEquipment = async () => {
        setLoading(true)
        try {
            const response = await getITEquipmentByIDService(id as string) as IITEquipmentAxiosResponse;
            if (response.status === 200) {
                setEquipment(response.data)
            }
        } catch (error) {
            console.log(error)
        }
        setLoading(false)
    }

    useEffect(() => { getITEquipment(); }, [])

    return (
        <Card sx={{ p: 4, boxShadow: 3 }}>

            {loading ? <Loading items='IT Asset' /> :
                <>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ boxShadow: 0, bgcolor: grey[100] }}>
                                <CardMedia
                                    component="img"
                                    height="250"
                                    image={PlaceHolder}
                                    alt="Equipment Image"
                                />
                                <CardContent>
                                    <Typography variant="h5" gutterBottom sx={{ color: "#1976d2" }}>
                                        {equipment.assetName}
                                    </Typography>
                                    <Divider />
                                    <DetailSection label='Hostname' text={equipment.hostname} />
                                    {equipment.model && <DetailSection label="Model" text={equipment.model} />}
                                    {equipment.serialNumber && <DetailSection label="Serial Number" text={equipment.serialNumber} />}
                                    {equipment.supplier && <DetailSection label="Supplier" text={equipment.supplier?.name} />}
                                    <DetailSection label="Purchase Cost" text={equipment.purchaseCost} />
                                    <DetailSection label="Date of Receipt" text={equipment.dateReceipt} />
                                    {equipment.branch && <DetailSection label="Location" text={equipment.branch.name} />}
                                    {equipment.assetStatus && <DetailSection label="Status" text={equipment.assetStatus.name} />}
                                    {equipment.description && <DetailSection label="Description" text={equipment.description} />}
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={8}>
                            <Card sx={{ boxShadow: 0, bgcolor: grey[100] }}>
                                <CardContent>
                                    <TabComponent
                                        headers={[
                                            {
                                                label: "Other Details",
                                                position: 0,
                                                content: <OtherDetails equipment={equipment} />
                                            },
                                            {
                                                label: "ASSIGNMENT HISTORY",
                                                position: 1,
                                                content: <AssignmentHistory id={equipment?.id as string} />
                                            },
                                            {
                                                label: "REPAIR TRAILS",
                                                position: 2,
                                                content: <RepairHistory id={equipment?.id as string} />
                                            },
                                        ]}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                    <Box sx={{ width: "100%", display: "flex", justifyContent: "end" }}>
                        <Stack direction="row" spacing={3} sx={{ width: "30%", mt: 3 }}>
                            <ButtonComponent
                                handleClick={() => console.log("information!!")}
                                buttonColor='error'
                                type='button'
                                sendingRequest={false}
                                buttonText="Back"
                            />
                            <ButtonComponent
                                buttonColor='info'
                                type='submit'
                                sendingRequest={false}
                                buttonText="Update" />
                        </Stack>
                    </Box>
                </>
            }
        </Card>
    );
};

export default ITEquipmentDetails;
