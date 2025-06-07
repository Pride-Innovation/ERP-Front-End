/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

export const formatNumberWithCommas = (value: number | string): string => {
    if (value === '' || isNaN(Number(value))) return '';
    return Number(value).toLocaleString('en-UG');
};