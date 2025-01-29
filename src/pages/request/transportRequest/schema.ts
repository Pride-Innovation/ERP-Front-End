import * as yup from 'yup';

export const transportRequestSchema = yup.object().shape({
    requestDate: yup.string().optional().nullable(),
    requesterID: yup.number().optional().nullable(),
    timeVehicleIsRequired: yup.string().required('Date Required is required'),
    dateVehicleIsRequired: yup.string().required('Date Required is required'),
    destination: yup.string().required('Destination is required'),
    purpose: yup.string().required('Purpose is required'),
    duration: yup.string().required('Duration is required'),
    priority: yup.string().required('Priority is required'),
    desc: yup.string().optional().nullable(),
    signature: yup.mixed().optional().nullable(),
    status: yup.string().optional().nullable(),
    position: yup.string().optional().nullable(),
    fromPosition: yup.string().optional().nullable(),
    Narration: yup.string().optional().nullable(),
});
