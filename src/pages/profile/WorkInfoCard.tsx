/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import {
    Box,
    Typography,
    Paper,
    Stack,
    alpha
} from "@mui/material";
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import ApartmentIcon from '@mui/icons-material/Apartment';
import BadgeIcon from '@mui/icons-material/Badge';
import PublicIcon from '@mui/icons-material/Public';
import MapIcon from '@mui/icons-material/Map';
import InfoItem from "./InfoItem";
import { IUser } from "../users/interface";

// Brand colors
const PRIMARY_COLOR = '#08796C';

interface WorkInfoCardProps {
    user: IUser | null;
}

const WorkInfoCard = ({ user }: WorkInfoCardProps) => {
    return (
        <Paper
            elevation={0}
            sx={{
                height: '100%',
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${alpha('#000', 0.08)}`,
            }}
        >
            {/* Section header */}
            <Box
                sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: `1px solid ${alpha('#000', 0.08)}`,
                    bgcolor: alpha(PRIMARY_COLOR, 0.03)
                }}
            >
                <Box
                    sx={{
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 1,
                        bgcolor: alpha(PRIMARY_COLOR, 0.1),
                        color: PRIMARY_COLOR,
                        mr: 1.5
                    }}
                >
                    <BusinessIcon fontSize="small" />
                </Box>
                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                    }}
                >
                    Work Information
                </Typography>
            </Box>

            {/* Content */}
            <Box sx={{ p: 2.5 }}>
                <Stack spacing={2}>
                    <InfoItem
                        icon={<BadgeIcon fontSize="small" />}
                        label="Staff Number"
                        value={user?.staffNumber || ''}
                        emptyText="Not assigned"
                        copyable
                    />

                    <InfoItem
                        icon={<WorkIcon fontSize="small" />}
                        label="Department"
                        value={user?.department?.name || ''}
                        emptyText="Not assigned"
                    />

                    <InfoItem
                        icon={<ApartmentIcon fontSize="small" />}
                        label="Branch"
                        value={user?.branch?.name || ''}
                        emptyText="Not assigned"
                    />

                    <InfoItem
                        icon={<PublicIcon fontSize="small" />}
                        label="Region"
                        value={user?.branch?.region?.name || ''}
                        emptyText="Not assigned"
                    />

                    <InfoItem
                        icon={<MapIcon fontSize="small" />}
                        label="District"
                        value={user?.branch?.district?.name || ''}
                        emptyText="Not assigned"
                    />
                </Stack>
            </Box>
        </Paper>
    );
};

export default WorkInfoCard;