import * as yup from 'yup';

export const departmentSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    desc: yup.string().nullable().optional(),
    status: yup.number().nullable().optional(),
    image: yup.mixed().nullable().optional(),
});
