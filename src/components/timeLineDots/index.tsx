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