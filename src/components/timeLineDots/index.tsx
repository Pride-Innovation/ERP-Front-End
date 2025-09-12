/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ITimeLineDot } from './interface'
import DoDisturbAltIcon from '@mui/icons-material/DoDisturbAlt';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import AddTaskIcon from '@mui/icons-material/AddTask';
import RecommendOutlinedIcon from '@mui/icons-material/RecommendOutlined';
import HdrAutoOutlinedIcon from '@mui/icons-material/HdrAutoOutlined';
import PublishedWithChangesOutlinedIcon from '@mui/icons-material/PublishedWithChangesOutlined';
import PlaylistAddCheckCircleOutlinedIcon from '@mui/icons-material/PlaylistAddCheckCircleOutlined';
import ThumbUpOffAltOutlinedIcon from '@mui/icons-material/ThumbUpOffAltOutlined';
import EditCalendarOutlinedIcon from '@mui/icons-material/EditCalendarOutlined';
import DoNotDisturbAltIcon from '@mui/icons-material/DoNotDisturbAlt';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import BlockIcon from '@mui/icons-material/Block';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import HttpsOutlinedIcon from '@mui/icons-material/HttpsOutlined';

/**
 * 
 * @param status 
 * @returns Icon based on the statuses, Active, Inactive, Disabled, Blocked, etc.
 */

const TimeLineDot = ({ status }: ITimeLineDot) => {

    // Convert status to lowercase for case-insensitive comparison
    const normalizedStatus = typeof status === 'string' ? status.toLowerCase() : '';

    // Status checks
    switch (normalizedStatus) {
        // Request statuses
        case "requestcreated":
            return <AddTaskIcon fontSize='small' color="success" sx={{ mr: "5px" }} />;
        case "requestrejected":
            return <DoNotDisturbAltIcon fontSize='small' color="error" sx={{ mr: "5px" }} />;
        case "requestapproved":
            return <RecommendOutlinedIcon fontSize='small' color="primary" sx={{ mr: "5px" }} />;
        case "requestacknowledged":
            return <HdrAutoOutlinedIcon fontSize='small' color="warning" sx={{ mr: "5px" }} />;
        case "requestissued":
            return <PublishedWithChangesOutlinedIcon fontSize='small' color="info" sx={{ mr: "5px" }} />;
        case "issuanceapproved":
            return <PlaylistAddCheckCircleOutlinedIcon fontSize='small' color="warning" sx={{ mr: "5px" }} />;
        case "receiptacknowledged":
            return <ThumbUpOffAltOutlinedIcon fontSize='small' color="primary" sx={{ mr: "5px" }} />;
        case "issuanceavailable":
            return <ErrorOutlineIcon fontSize='small' color="warning" sx={{ mr: "5px" }} />;
        case "requireupdate":
            return <EditCalendarOutlinedIcon fontSize='small' color="error" sx={{ mr: "5px" }} />;

        // Stock statuses
        case "in stock":
        case "stockcompleted":
            return <CheckCircleOutlineOutlinedIcon fontSize='small' color="primary" sx={{ mr: "5px" }} />;
        case "stockpending":
            return <AutorenewIcon fontSize='small' color="warning" sx={{ mr: "5px" }} />;

        // User account statuses
        case "active":
        case "active status":
            return <CheckCircleIcon fontSize='small' color="success" sx={{ mr: "5px" }} />;
        case "inactive":
        case "inactive status":
            return <PauseCircleOutlineIcon fontSize='small' color="warning" sx={{ mr: "5px" }} />;
        case "blocked":
        case "blocked status":
            return <BlockIcon fontSize='small' color="error" sx={{ mr: "5px" }} />;
        case "disabled":
        case "disabled status":
            return <NotInterestedIcon fontSize='small' color="error" sx={{ mr: "5px" }} />;

        case "locked":
        case "locked status":
            return <HttpsOutlinedIcon fontSize='small' color="error" sx={{ mr: "5px" }} />;

        // Default fallback
        default:
            return <DoDisturbAltIcon fontSize='small' color="secondary" sx={{ mr: "5px" }} />;
    }
};

export default TimeLineDot;