/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { blue, orange, purple, yellow } from '@mui/material/colors';

const DoughnutChartUtills = () => {
    const colors = [blue[700], yellow[500], orange[500], purple[500]]

    const data = {
        labels: [
            "Asset 1",
            "Asset 2",
            "Asset 3",
            "Asset 4",
            "Asset 5",
        ],
        datasets: [
            {
                label: '% of Assets',
                data: [6, 7, 4, 5, 8],
                backgroundColor: [...colors],
                borderColor: [...colors],
                borderWidth: 0,
                spacing: 5,
                radius: '75%',
                cutout: '10%'
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: 1,
        plugins: {
            title: {
                display: true,
                text: 'ASSETS IN STORE',
                font: { size: 14 }
            },
            legend: {
                display: true,
                position: 'top' as const,
            },
        },
    };
    return ({
        data,
        options
    })
}

export default DoughnutChartUtills