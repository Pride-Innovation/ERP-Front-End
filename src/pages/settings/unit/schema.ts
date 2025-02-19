import * as yup from 'yup';

export const unitSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    department_id: yup.number().required('Department ID is required'),
    status: yup.number().nullable().optional(),
    head: yup.string().nullable().optional(),
    desc: yup.string().nullable().optional(),
});
