/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

export const barGraphMock: Array<{
    label: string,
    data: Array<number>,
    backgroundColor: string
}> = [
        {
            label: 'IT Equipment',
            data: [660, 700, 440, 550, 380, 390],
            backgroundColor: '#08796C',
        },
        {
            label: 'Office Equipment',
            data: [520, 550, 380, 435, 220, 100],
            backgroundColor: '#0D9986',
        },
        {
            label: 'Fleet',
            data: [500, 340, 205, 660, 700, 440],
            backgroundColor: '#BC892C',
        },
        {
            label: 'Stationery',
            data: [550, 380, 620, 480, 310, 400],
            backgroundColor: '#E0B973',
        },
    ];