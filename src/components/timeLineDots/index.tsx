/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { ITimeLineDot } from './interface'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DoDisturbAltIcon from '@mui/icons-material/DoDisturbAlt';
// import BlockIcon from '@mui/icons-material/Block';

/**
 * 
 * @param status 
 * @returns Icon based on the statuses, Active, Inactive, Disabled or Blocked
 */

/*
 ******TO DO******
 Add icons for all different statuses. 
*/

const TimeLineDot = ({ status }: ITimeLineDot) => {
    return status === "active" ? (
        <CheckCircleOutlineIcon fontSize='small' color="primary" sx={{ mr: "5px" }} />
    ) : (
        <DoDisturbAltIcon fontSize='small' color="secondary" sx={{ mr: "5px" }} />
    )
}

export default TimeLineDot