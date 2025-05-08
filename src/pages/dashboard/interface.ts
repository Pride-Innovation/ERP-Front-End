/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

export interface IDashboardCard {
    image: string;
    number: number;
    name: string;
    stockLevel: string;
    lastUpdated: string
}

export interface IStockIndicatorProps {
    color: string;
}

export interface IStockDetails {
    color: string;
    status: string;
}