/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { Box } from '@mui/material'
import { ITimeLineDot } from './interface'

const TimeLineDot = ({ color }: ITimeLineDot) => {
    return (
        <Box
            color={color}
            sx={{
                height: 12,
                width: 12,
                borderRadius: '50%',
                bgcolor: color,
                m: 1
            }} />
    )
}

export default TimeLineDot