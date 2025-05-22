/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { GridRowModel } from "@mui/x-data-grid";
import MaleAvatar from '../statics/images/male.jpg';
import FemaleAvatar from '../statics/images/Female.jpg';
import { RowData, ValidationResult } from "../components/forms/interface";

export const camelCaseToWords = (camelCaseString: string) => {
    return camelCaseString
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/_/g, ' ')
        .replace(/^./, (str) => str.toUpperCase());
}


export const convertStringToUpperCase = (str: string) => {

    const arr = str.toLowerCase().split(" ");

    for (var i = 0; i < arr.length; i++) {
        arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);

    };

    const str2 = arr.join(" ");
    return str2;
}


export const isCamelCase = (str: string): boolean => {
    const camelCaseRegex = /^[a-z]+([A-Z][a-z]*)*$/;
    return camelCaseRegex.test(str);
}

export const determineImage = (row: GridRowModel): string => {
    if (Object.keys(row).includes("gender")) {
        const gender = (row["gender"]).toLowerCase();
        if (gender === "male") {
            return MaleAvatar
        }
        if (gender === "female") {
            return FemaleAvatar
        }
    }

    return row?.image;
}

export const getLastSixMonths = (): string[] => {
    const monthsOfYear = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const currentDate = new Date();
    const lastSixMonths = [];

    for (let i = 5; i >= 0; i--) {
        const month = new Date(currentDate);
        month.setMonth(month.getMonth() - i);

        const monthName = monthsOfYear[month.getMonth()];
        const year = month.getFullYear();

        if (i === 0) {
            lastSixMonths.push(`This Month (${year})`);
        } else {
            lastSixMonths.push(`${monthName} ${year}`);
        }
    }

    return lastSixMonths;
};

export const formatToUGXMoney = (amount: string): string => {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount)) {
        console.log(numAmount, "Not a number!!!")
    }

    const formatter = new Intl.NumberFormat('en-UG', {
        style: 'currency',
        currency: 'UGX',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    return formatter.format(numAmount);
}


export function validateInventoryItems(items: any[]): ValidationResult {
    const errors: string[] = [];

    if (!Array.isArray(items) || items.length === 0) {
        errors.push('At least one inventory item is required.');
        return { isValid: false, errors };
    }

    const validItems: RowData[] = [];

    items.forEach((item, index) => {
        const prefix = `Item ${index + 1}:`;

        if (typeof item !== 'object' || item === null) {
            errors.push(`${prefix} Item must be an object.`);
            return;
        }

        const { id, name, groupName, quantity } = item;

        if (typeof id !== 'number') {
            errors.push(`${prefix} ID must be a number.`);
        }

        if (typeof name !== 'string' || name.trim() === '') {
            errors.push(`${prefix} Name is required and must be a non-empty string.`);
        }

        if (typeof groupName !== 'string' || groupName.trim() === '') {
            errors.push(`${prefix} Group Name is required and must be a non-empty string.`);
        }

        if (typeof quantity !== 'number' || quantity <= 0) {
            errors.push(`${prefix} Quantity must be a number greater than 0.`);
        }

        if (
            typeof id === 'number' &&
            typeof name === 'string' && name.trim() !== '' &&
            typeof groupName === 'string' && groupName.trim() !== '' &&
            typeof quantity === 'number' && quantity > 0
        ) {
            validItems.push({ id, name: name.trim(), groupName: groupName.trim(), quantity });
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
        validData: errors.length === 0 ? validItems : undefined,
    };
}