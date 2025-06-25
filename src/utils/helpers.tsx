/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { GridRowModel } from "@mui/x-data-grid";
import MaleAvatar from '../statics/images/male.jpg';
import FemaleAvatar from '../statics/images/Female.jpg';
import { RowData, StockRowData, StockValidationResult, ValidationResult } from "../components/forms/interface";
import { ICommodity } from "../pages/settings/commodity/interface";
import { IAssetType } from "../pages/settings/assetTypes/interface";
import { assetTypesStatusConstants } from "./constants";

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

        const { name, groupName, quantity, commodityId } = item;

        if (typeof commodityId !== 'number') {
            errors.push(`${prefix} ID must be a number.`);
        }

        if (typeof name !== 'string' || name.trim() === '') {
            errors.push(`${prefix} Name is required and must be a non-empty string.`);
        }

        if (typeof groupName !== 'string' || groupName.trim() === '') {
            errors.push(`${prefix} Unit of Measure is required and must be a non-empty string.`);
        }

        if (typeof quantity !== 'number' || quantity <= 0) {
            errors.push(`${prefix} Quantity must be a number greater than 0.`);
        }

        if (
            typeof commodityId === 'number' &&
            typeof name === 'string' && name.trim() !== '' &&
            typeof groupName === 'string' && groupName.trim() !== '' &&
            typeof quantity === 'number' && quantity > 0
        ) {
            validItems.push({ id: commodityId, name: name.trim(), groupName: groupName.trim(), quantity });
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
        validData: errors.length === 0 ? validItems : undefined,
    };
}


export function validateStockItems(items: any[]): StockValidationResult {
    const errors: string[] = [];

    if (!Array.isArray(items) || items.length === 0) {
        errors.push('At least one inventory item is required.');
        return { isValid: false, errors };
    }

    const validItems: StockRowData[] = [];

    items.forEach((item, index) => {
        const prefix = `Item ${index + 1}:`;

        if (typeof item !== 'object' || item === null) {
            errors.push(`${prefix} Item must be an object.`);
            return;
        }

        const {

            name,
            groupName,
            orderedQuantity,
            deliveredQuantity,
            commodityId,
            costPrice,
            purchasePrice
        } = item;

        if (typeof commodityId !== 'number') {
            errors.push(`${prefix} ID must be a number.`);
        }

        if (typeof name !== 'string' || name.trim() === '') {
            errors.push(`${prefix} Name is required and must be a non-empty string.`);
        }

        if (typeof groupName !== 'string' || groupName.trim() === '') {
            errors.push(`${prefix} Group Name is required and must be a non-empty string.`);
        }

        if (typeof orderedQuantity !== 'number' || orderedQuantity <= 0) {
            errors.push(`${prefix} Ordered Quantity must be a number greater than 0.`);
        }

        if (typeof deliveredQuantity !== 'number' || deliveredQuantity <= 0) {
            errors.push(`${prefix} Delivered Quantity must be a number greater than 0.`);
        }

        if (typeof costPrice !== 'number' || costPrice <= 0) {
            errors.push(`${prefix} Cost Price must be a number greater than 0.`);
        }

        if (typeof purchasePrice !== 'number' || purchasePrice <= 0) {
            errors.push(`${prefix} Purchase Price must be a number greater than 0.`);
        }

        if (
            typeof commodityId === 'number' &&
            typeof name === 'string' && name.trim() !== '' &&
            typeof groupName === 'string' && groupName.trim() !== '' &&
            typeof orderedQuantity === 'number' && orderedQuantity > 0 &&
            typeof deliveredQuantity === 'number' && deliveredQuantity > 0 &&
            typeof costPrice === 'number' && costPrice > 0 &&
            typeof purchasePrice === 'number' && purchasePrice > 0
        ) {
            validItems.push({
                id: commodityId,
                name: name.trim(),
                groupName: groupName.trim(),
                orderedQuantity,
                deliveredQuantity,
                costPrice,
                purchasePrice,
                commodityId
            });
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
        validData: errors.length === 0 ? validItems : undefined,
    };
}


const generatedRefs = new Set<string>();

export const generateReferenceNumber = (): string => {
    const prefix = 'PRD';
    const totalLength = 12;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    let ref: string;

    do {
        const timestamp = Date.now().toString(36).toUpperCase();
        const randomPartLength = totalLength - prefix.length - timestamp.length;

        let randomPart = '';
        for (let i = 0; i < randomPartLength; i++) {
            const randIndex = Math.floor(Math.random() * charset.length);
            randomPart += charset[randIndex];
        }

        ref = `${prefix}${timestamp}${randomPart}`;
    } while (generatedRefs.has(ref));

    generatedRefs.add(ref);
    return ref;
}


export const validateCommodityQuantities = (
    inputData: Array<{ commodity: ICommodity; quantity: number }>,
    records: RowData[]
): ValidationResult => {
    const errors: string[] = [];

    inputData.forEach(input => {
        const matchingRecord = records.find(
            record => record.commodityId === input.commodity.id
        );

        if (!matchingRecord) {
            errors.push(`Commodity '${input.commodity.name}' not found in records.`);
        } else if (matchingRecord.quantity !== input.quantity) {
            errors.push(
                `Quantity mismatch for '${input.commodity.name}': expected ${input.quantity}, found ${matchingRecord.quantity}.`
            );
        }
    });

    return {
        isValid: errors.length === 0,
        errors
    };
}


export const validateAssetsOfItems = (
    rows: RowData[],
    assetTypes: IAssetType[]
): ValidationResult => {
    const errors: string[] = [];
    const engravedNumbersSet: Set<string> = new Set();
    const validItems: RowData[] = [];

    rows.forEach((record, index) => {
        const { quantity, selectedAssets } = record;
        const prefix = `Item ${index + 1}:`;

        const assetTypeName = assetTypes.find(ast => record.assetTypeId === ast.id)?.name;

        let hasError = false;

        // Quantity mismatch validation (excluding stationery)
        if (
            assetTypeName &&
            assetTypeName !== assetTypesStatusConstants.stationery &&
            selectedAssets?.length !== quantity
        ) {
            errors.push(
                `${prefix} Quantity mismatch for '${record.name}': expected ${quantity}, found ${selectedAssets?.length || 0}.`
            );
            hasError = true;
        }

        // Duplicate engravedNumber validation
        selectedAssets?.forEach(asset => {
            if (engravedNumbersSet.has(asset.engravedNumber)) {
                errors.push(
                    `${prefix} Duplicate engravedNumber '${asset.engravedNumber}' found in '${record.name}'.`
                );
                hasError = true;
            } else {
                engravedNumbersSet.add(asset.engravedNumber);
            }
        });

        if (!hasError) {
            validItems.push(record);
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
        validData: errors.length === 0 ? validItems : undefined
    };
};

