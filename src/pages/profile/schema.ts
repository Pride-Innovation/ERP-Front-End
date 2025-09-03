/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import dayjs from 'dayjs';
import * as yup from 'yup';

export const changePasswordSchema = yup.object().shape({
    oldPassword: yup.string().required('Old Password is required'),
    newPassword: yup.string().required('Please enter your password.'),
    confirmPassword: yup.string().required('Please retype your password.')
        .oneOf([yup.ref('newPassword')], 'Your passwords do not match.')
});


// Convert Dayjs to Date for Yup validation
const dayjsToDate = (value: any, originalValue: any) => {
    if (dayjs.isDayjs(originalValue)) {
        return originalValue.toDate();
    }
    return originalValue;
};

export const leaveSchema = yup.object().shape({
    leaveType: yup.string().required('Please select leave type'),
    startDate: yup.date().transform(dayjsToDate)
        .required('Start date is required')
        .min(new Date(), 'Start date must be in the future'),
    endDate: yup.date().transform(dayjsToDate)
        .required('End date is required')
        .min(
            yup.ref('startDate'),
            'End date must be after start date'
        ),
    actingPerson: yup.string().required('Please select someone to act in your absence'),
    reason: yup.string().required('Please provide a reason for your leave')
        .min(10, 'Please provide more details (minimum 10 characters)')
});