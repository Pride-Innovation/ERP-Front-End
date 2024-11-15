import { GridRowModel } from "@mui/x-data-grid";
import MaleAvatar from '../statics/images/male.jpg';
import FemaleAvatar from '../statics/images/Female.jpg';
// import Placeholder from '../statics/images/Placeholder.png';

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

    // return Placeholder;
    return MaleAvatar;
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