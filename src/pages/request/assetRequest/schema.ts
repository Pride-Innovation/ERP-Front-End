import * as yup from 'yup';

export const requestSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    requestDate: yup.string().optional().nullable(),
    requesterID: yup.number().optional().nullable(),
    // quantity: yup.number().required('Quantity is required').positive().integer(),
    quantity: yup.number().optional().nullable(),
    priority: yup.string().required('Priority is required'),
    timeOfSubmissionOfRequest: yup.string().optional().nullable(),
    desc: yup.string().optional().nullable(),
    signature: yup.mixed().optional().nullable(),
    status: yup.string().nullable().optional(),
    position: yup.string().optional().nullable(),
    fromPosition: yup.string().optional().nullable(),
    Narration: yup.string().optional().nullable(),
});
