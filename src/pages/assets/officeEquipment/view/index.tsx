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
    CardMedia,
    Divider,
    Grid,
    Stack,
    Typography
} from "@mui/material";
import PlaceHolder from "../../../../statics/images/Placeholder.png";
import { grey } from "@mui/material/colors";
import TabComponent from "../../../../components/tabs";
import DetailSection from "../../trails/DetailSection";
import AssignmentHistory from "../../trails/AssignmentHistory";
import RepairHistory from "../../trails/RepairHistory";
import ButtonComponent from "../../../../components/forms/Button";
import { IOfficeEquipment } from "../interface";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getOfficeEquipmentByIDService } from "../service";


const OfficeEquipmentDetails = () => {
    const [equipment, setEquipment] = useState<IOfficeEquipment>({} as IOfficeEquipment)
    const { id } = useParams<{ id: string }>();

    const getITEquipment = async () => {
        const response = await getOfficeEquipmentByIDService(id as string) as IOfficeEquipment;
        setEquipment(response);
    }

    useEffect(() => { getITEquipment(); }, [])
    return (
        <Card sx={{ p: 4, boxShadow: 3 }}>
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
                            <DetailSection label="Supplier" text={equipment.supplier} />
                            <DetailSection label="Purchase Cost" text={equipment.purchaseCost} />
                            <DetailSection label="Date of Receipt" text={equipment.dateReceipt} />
                            {equipment.assetStatus && <DetailSection label="Status" text={equipment.assetStatus} />}
                            {equipment.desc && <DetailSection label="Description" text={equipment.desc} />}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Card sx={{ boxShadow: 0, bgcolor: grey[100] }}>
                        <CardContent>
                            <TabComponent
                                headers={[
                                    {
                                        label: "ASSIGNMENT HISTORY",
                                        position: 0,
                                        content: <AssignmentHistory id={equipment?.id as string} />
                                    },
                                    {
                                        label: "REPAIR TRAILS",
                                        position: 1,
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
        </Card>
    );
}

export default OfficeEquipmentDetails;