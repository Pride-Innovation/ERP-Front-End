import { blue, orange, purple, yellow } from "@mui/material/colors";

export const barGraphMock: Array<{
    label: string,
    data: Array<number>,
    backgroundColor: string
}> = [
        {
            label: 'IT Equipment',
            data: [660, 700, 440, 550, 380, 390],
            backgroundColor: orange[500],
        },
        {
            label: 'Office Equipment',
            data: [520, 550, 380, 435, 220, 100],
            backgroundColor: blue[700],
        },
        {
            label: 'Fleet',
            data: [500, 340, 205, 660, 700, 440],
            backgroundColor: yellow[500],
        },
        {
            label: 'Stationery',
            data: [550, 380, 620, 480, 310, 400],
            backgroundColor: purple[500],
        },
    ]