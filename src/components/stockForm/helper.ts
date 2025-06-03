export const formatNumberWithCommas = (value: number | string): string => {
    if (value === '' || isNaN(Number(value))) return '';
    return Number(value).toLocaleString('en-UG');
};